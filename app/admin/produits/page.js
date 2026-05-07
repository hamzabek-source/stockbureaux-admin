'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export default function Produits() {
  const [produits, setProduits] = useState([])
  const [categories, setCategories] = useState([])
  const [sousCats, setSousCats] = useState([])
  const [form, setForm] = useState({ nom: '', description: '', categorie_id: '', sous_categorie_id: '' })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [attributes, setAttributes] = useState([])

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [p, c, s] = await Promise.all([
      supabase.from('produits').select('*, categories(nom), sous_categories(nom)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('nom'),
      supabase.from('sous_categories').select('*').order('nom'),
    ])
    setProduits(p.data || [])
    setCategories(c.data || [])
    setSousCats(s.data || [])
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function addAttribute() {
    setAttributes([...attributes, { nom: '', type: 'button', valeurs: [] }])
  }

  function updateAttr(i, key, val) {
    const updated = [...attributes]
    updated[i][key] = val
    setAttributes(updated)
  }

  function addValeur(i) {
    const updated = [...attributes]
    updated[i].valeurs = [...updated[i].valeurs, { label: '', image_url: '' }]
    setAttributes(updated)
  }

  function updateValeur(attrI, valI, key, val) {
    const updated = [...attributes]
    updated[attrI].valeurs[valI][key] = val
    setAttributes(updated)
  }

  function removeValeur(attrI, valI) {
    const updated = [...attributes]
    updated[attrI].valeurs = updated[attrI].valeurs.filter((_, j) => j !== valI)
    setAttributes(updated)
  }

  function removeAttr(i) {
    setAttributes(attributes.filter((_, j) => j !== i))
  }

  async function uploadSwatchImage(attrI, valI, file) {
    const fileName = `swatch-${Date.now()}-${file.name}`
    await supabase.storage.from('images').upload(fileName, file)
    const { data } = supabase.storage.from('images').getPublicUrl(fileName)
    updateValeur(attrI, valI, 'image_url', data.publicUrl)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (images.length === 0) { alert('Veuillez ajouter au moins une image'); return }
    setLoading(true)

    let imageUrls = []
    for (let img of images) {
      const fileName = `${Date.now()}-${img.name}`
      await supabase.storage.from('images').upload(fileName, img)
      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
      imageUrls.push(data.publicUrl)
    }

    const { data: newProd } = await supabase.from('produits').insert({
      ...form,
      image_url: imageUrls[0] || '',
      images: imageUrls
    }).select().single()

    if (newProd && attributes.length > 0) {
      for (let attr of attributes) {
        if (attr.nom) {
          await supabase.from('product_attributes').insert({
            produit_id: newProd.id,
            nom: attr.nom,
            type: attr.type,
            valeurs: attr.valeurs
          })
        }
      }
    }

    setForm({ nom: '', description: '', categorie_id: '', sous_categorie_id: '' })
    setImages([])
    setPreviews([])
    setAttributes([])
    setLoading(false)
    loadAll()
  }

  async function deleteProduit(id) {
    if (!confirm('Supprimer ce produit ?')) return
    await supabase.from('produits').delete().eq('id', id)
    loadAll()
  }

  const filteredSousCats = sousCats.filter(s => s.categorie_id === form.categorie_id)
  const input = { width:'100%', padding:'10px 14px', border:'1px solid #ddd', borderRadius:'4px', fontSize:'13px', outline:'none', boxSizing:'border-box' }
  const labelStyle = { fontSize:'11px', letterSpacing:'.08em', textTransform:'uppercase', color:'#6E6E6E', display:'block', marginBottom:'6px' }

  const attrTypes = [
    { value: 'button', label: 'Boutons (dimensions, options)' },
    { value: 'color', label: 'Couleurs tissu / PVC' },
    { value: 'swatch', label: 'Nuancier bois / image' },
  ]

  return (
    <div>
      <h1 style={{fontSize:'24px',fontWeight:600,marginBottom:'8px'}}>Produits</h1>
      <p style={{fontSize:'13px',color:'#6E6E6E',marginBottom:'32px'}}>Gérer les produits du catalogue</p>

      <form onSubmit={handleSubmit} style={{background:'white',padding:'24px',borderRadius:'8px',border:'1px solid #eee',marginBottom:'24px'}}>
        <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'16px'}}>Nouveau produit</h2>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
          <div>
            <label style={labelStyle}>Nom *</label>
            <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required style={input} />
          </div>
          <div>
            <label style={labelStyle}>Catégorie</label>
            <select value={form.categorie_id} onChange={e => setForm({...form, categorie_id: e.target.value, sous_categorie_id: ''})} style={input}>
              <option value="">-- Choisir --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Sous-catégorie</label>
            <select value={form.sous_categorie_id} onChange={e => setForm({...form, sous_categorie_id: e.target.value})} style={input}>
              <option value="">-- Choisir --</option>
              {filteredSousCats.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
        </div>

        <div style={{marginBottom:'16px'}}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} style={{...input, resize:'vertical'}} />
        </div>

        {/* IMAGES */}
        <div style={{marginBottom:'24px'}}>
          <label style={labelStyle}>Images * (plusieurs possibles)</label>
          <label style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'10px 20px',background:'#003CC7',color:'white',borderRadius:'4px',cursor:'pointer',fontSize:'13px',fontWeight:500}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Choisir des images
            <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{display:'none'}} />
          </label>
          {previews.length > 0 && (
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'12px'}}>
              {previews.map((src, i) => (
                <div key={i} style={{position:'relative'}}>
                  <img src={src} style={{width:'72px',height:'72px',objectFit:'cover',borderRadius:'4px',border:'1px solid #eee'}} />
                  <div style={{position:'absolute',top:'-6px',right:'-6px',background:'#cc0000',color:'white',borderRadius:'50%',width:'18px',height:'18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',cursor:'pointer'}} onClick={() => {
                    const ni = images.filter((_,j)=>j!==i); const np = previews.filter((_,j)=>j!==i)
                    setImages(ni); setPreviews(np)
                  }}>×</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ATTRIBUTES */}
        <div style={{borderTop:'1px solid #eee',paddingTop:'20px',marginBottom:'20px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
            <div>
              <div style={{fontSize:'15px',fontWeight:600,color:'#0C0C0C'}}>Options du produit</div>
              <div style={{fontSize:'12px',color:'#6E6E6E',marginTop:'2px'}}>Dimensions, couleurs, nuanciers...</div>
            </div>
            <button type="button" onClick={addAttribute} style={{background:'#f0f0f0',color:'#0C0C0C',padding:'8px 16px',border:'none',borderRadius:'4px',fontSize:'12px',cursor:'pointer',fontWeight:500}}>
              + Ajouter une option
            </button>
          </div>

          {attributes.map((attr, i) => (
            <div key={i} style={{border:'1px solid #eee',borderRadius:'8px',padding:'16px',marginBottom:'12px',background:'#fafafa'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'12px',marginBottom:'12px',alignItems:'flex-end'}}>
                <div>
                  <label style={labelStyle}>Nom du groupe</label>
                  <input value={attr.nom} onChange={e => updateAttr(i,'nom',e.target.value)} placeholder="ex: Dimension Largeur (A) en cm" style={input} />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select value={attr.type} onChange={e => updateAttr(i,'type',e.target.value)} style={input}>
                    {attrTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => removeAttr(i)} style={{padding:'10px 14px',background:'#fff5f5',border:'1px solid #ffcccc',borderRadius:'4px',color:'#cc0000',cursor:'pointer',fontSize:'13px'}}>✕</button>
              </div>

              {/* VALUES */}
              <div style={{marginBottom:'8px'}}>
                <label style={labelStyle}>Valeurs</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'8px'}}>
                  {attr.valeurs.map((v, j) => (
                    <div key={j} style={{display:'flex',alignItems:'center',gap:'6px',background:'white',border:'1px solid #ddd',borderRadius:'4px',padding:'6px 10px'}}>
                      {(attr.type === 'color' || attr.type === 'swatch') && (
                        <div style={{position:'relative'}}>
                          {v.image_url
                            ? <img src={v.image_url} style={{width:'32px',height:'32px',objectFit:'cover',borderRadius:'2px',border:'1px solid #eee'}} />
                            : <label style={{width:'32px',height:'32px',background:'#f0f0f0',borderRadius:'2px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'16px'}}>
                                +
                                <input type="file" accept="image/*" style={{display:'none'}} onChange={e => e.target.files[0] && uploadSwatchImage(i, j, e.target.files[0])} />
                              </label>
                          }
                        </div>
                      )}
                      <input
                        value={v.label}
                        onChange={e => updateValeur(i,j,'label',e.target.value)}
                        placeholder={attr.type === 'button' ? 'ex: 80' : 'ex: Bleu'}
                        style={{border:'none',outline:'none',fontSize:'13px',width:'80px'}}
                      />
                      <span style={{cursor:'pointer',color:'#cc0000',fontSize:'12px'}} onClick={() => removeValeur(i,j)}>✕</span>
                    </div>
                  ))}
                  <button type="button" onClick={() => addValeur(i)} style={{padding:'6px 12px',background:'white',border:'1px dashed #ddd',borderRadius:'4px',fontSize:'12px',cursor:'pointer',color:'#6E6E6E'}}>
                    + Valeur
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} style={{background:'#003CC7',color:'white',padding:'10px 24px',border:'none',borderRadius:'4px',fontSize:'13px',cursor:'pointer'}}>
          {loading ? 'Enregistrement...' : '+ Ajouter le produit'}
        </button>
      </form>

      {/* PRODUCTS LIST */}
      <div style={{background:'white',borderRadius:'8px',border:'1px solid #eee',overflow:'hidden'}}>
        {produits.length === 0 && <div style={{padding:'32px',textAlign:'center',color:'#6E6E6E',fontSize:'13px'}}>Aucun produit</div>}
        {produits.map((p, i) => (
          <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderBottom: i < produits.length-1 ? '1px solid #f0f0f0':'none',gap:'16px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
              <div style={{display:'flex',gap:'4px'}}>
                {(p.images && p.images.length > 0 ? p.images : [p.image_url]).filter(Boolean).slice(0,3).map((url, idx) => (
                  <img key={idx} src={url} style={{width:'50px',height:'50px',objectFit:'cover',borderRadius:'4px'}} />
                ))}
              </div>
              <div>
                <div style={{fontSize:'14px',fontWeight:500,color:'#0C0C0C'}}>{p.nom}</div>
                <div style={{fontSize:'12px',color:'#6E6E6E',marginTop:'2px'}}>
                  {p.categories?.nom} {p.sous_categories?.nom && `· ${p.sous_categories.nom}`}
                </div>
                {p.images && p.images.length > 1 && <div style={{fontSize:'11px',color:'#003CC7',marginTop:'2px'}}>{p.images.length} images</div>}
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',flexShrink:0}}>
              <a href={`/admin/produits/${p.id}`} style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #ddd',borderRadius:'4px',textDecoration:'none',color:'#0C0C0C'}}>Modifier</a>
              <button onClick={() => deleteProduit(p.id)} style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #ffcccc',borderRadius:'4px',background:'#fff5f5',color:'#cc0000',cursor:'pointer'}}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
