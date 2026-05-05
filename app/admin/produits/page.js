'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export default function Produits() {
  const [produits, setProduits] = useState([])
  const [categories, setCategories] = useState([])
  const [sousCats, setSousCats] = useState([])
  const [form, setForm] = useState({ nom: '', description: '', categorie_id: '', sous_categorie_id: '' })
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

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

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    let imageUrls = []

    for (let img of images) {
      const fileName = `${Date.now()}-${img.name}`
      await supabase.storage.from('images').upload(fileName, img)
      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
      imageUrls.push(data.publicUrl)
    }

    await supabase.from('produits').insert({ 
      ...form, 
      image_url: imageUrls[0] || '',
      images: imageUrls 
    })
    setForm({ nom: '', description: '', categorie_id: '', sous_categorie_id: '' })
    setImages([])
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
  const label = { fontSize:'11px', letterSpacing:'.08em', textTransform:'uppercase', color:'#6E6E6E', display:'block', marginBottom:'6px' }

  return (
    <div>
      <h1 style={{fontSize:'24px',fontWeight:600,marginBottom:'8px'}}>Produits</h1>
      <p style={{fontSize:'13px',color:'#6E6E6E',marginBottom:'32px'}}>Gérer les produits du catalogue</p>

      <form onSubmit={handleSubmit} style={{background:'white',padding:'24px',borderRadius:'8px',border:'1px solid #eee',marginBottom:'24px'}}>
        <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'16px'}}>Nouveau produit</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
          <div>
            <label style={label}>Nom</label>
            <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} required style={input} />
          </div>
          <div>
            <label style={label}>Catégorie</label>
            <select value={form.categorie_id} onChange={e => setForm({...form, categorie_id: e.target.value, sous_categorie_id: ''})} style={input}>
              <option value="">-- Choisir --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Sous-catégorie</label>
            <select value={form.sous_categorie_id} onChange={e => setForm({...form, sous_categorie_id: e.target.value})} style={input}>
              <option value="">-- Choisir --</option>
              {filteredSousCats.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Images (plusieurs possibles)</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple
              onChange={e => setImages(Array.from(e.target.files))} 
              style={{fontSize:'13px',paddingTop:'8px'}} 
            />
            {images.length > 0 && (
              <div style={{marginTop:'8px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
                {Array.from(images).map((img, i) => (
                  <div key={i} style={{fontSize:'11px',background:'#f0f0f0',padding:'4px 8px',borderRadius:'4px',color:'#6E6E6E'}}>
                    {img.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{marginBottom:'16px'}}>
          <label style={label}>Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} style={{...input, resize:'vertical'}} />
        </div>
        <button type="submit" disabled={loading} style={{background:'#003CC7',color:'white',padding:'10px 24px',border:'none',borderRadius:'4px',fontSize:'13px',cursor:'pointer'}}>
          {loading ? 'Enregistrement...' : '+ Ajouter'}
        </button>
      </form>

      <div style={{background:'white',borderRadius:'8px',border:'1px solid #eee',overflow:'hidden'}}>
        {produits.length === 0 && (
          <div style={{padding:'32px',textAlign:'center',color:'#6E6E6E',fontSize:'13px'}}>Aucun produit</div>
        )}
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
                {p.images && p.images.length > 1 && (
                  <div style={{fontSize:'11px',color:'#003CC7',marginTop:'2px'}}>{p.images.length} images</div>
                )}
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',flexShrink:0}}>
              <a href={`/admin/produits/${p.id}`} style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #ddd',borderRadius:'4px',textDecoration:'none',color:'#0C0C0C'}}>
                Modifier
              </a>
              <button onClick={() => deleteProduit(p.id)} style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #ffcccc',borderRadius:'4px',background:'#fff5f5',color:'#cc0000',cursor:'pointer'}}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}