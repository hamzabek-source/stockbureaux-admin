'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [sousCats, setSousCats] = useState([])
  const [nom, setNom] = useState('')
  const [nomSous, setNomSous] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingId, setUploadingId] = useState(null)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [c, s] = await Promise.all([
      supabase.from('categories').select('*').order('nom'),
      supabase.from('sous_categories').select('*, categories(nom)').order('nom'),
    ])
    setCategories(c.data || [])
    setSousCats(s.data || [])
  }

  async function addCategory(e) {
    e.preventDefault()
    if (!nom) return
    setLoading(true)
    await supabase.from('categories').insert({ nom })
    setNom('')
    setLoading(false)
    loadAll()
  }

  async function addSousCategory(e) {
    e.preventDefault()
    if (!nomSous || !selectedCat) return
    setLoading(true)
    await supabase.from('sous_categories').insert({ nom: nomSous, categorie_id: selectedCat })
    setNomSous('')
    setSelectedCat('')
    setLoading(false)
    loadAll()
  }

  async function deleteCategory(id) {
    if (!confirm('Supprimer cette catégorie ?')) return
    await supabase.from('categories').delete().eq('id', id)
    loadAll()
  }

  async function deleteSousCat(id) {
    if (!confirm('Supprimer cette sous-catégorie ?')) return
    await supabase.from('sous_categories').delete().eq('id', id)
    loadAll()
  }

  async function uploadImage(id, file, table) {
    setUploadingId(id)
    const fileName = `${Date.now()}-${file.name}`
    await supabase.storage.from('images').upload(fileName, file)
    const { data } = supabase.storage.from('images').getPublicUrl(fileName)
    await supabase.from(table).update({ image_url: data.publicUrl }).eq('id', id)
    setUploadingId(null)
    loadAll()
  }

  const card = { background:'white', padding:'24px', borderRadius:'8px', border:'1px solid #eee', marginBottom:'24px' }
  const input = { width:'100%', padding:'10px 14px', border:'1px solid #ddd', borderRadius:'4px', fontSize:'13px', outline:'none', boxSizing:'border-box' }
  const label = { fontSize:'11px', letterSpacing:'.08em', textTransform:'uppercase', color:'#6E6E6E', display:'block', marginBottom:'6px' }
  const btn = { background:'#003CC7', color:'white', padding:'10px 20px', border:'none', borderRadius:'4px', fontSize:'13px', cursor:'pointer' }

  return (
    <div>
      <h1 style={{fontSize:'24px',fontWeight:600,marginBottom:'8px'}}>Catégories</h1>
      <p style={{fontSize:'13px',color:'#6E6E6E',marginBottom:'32px'}}>Gérer les catégories et sous-catégories</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',marginBottom:'32px'}}>
        <form onSubmit={addCategory} style={card}>
          <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'16px'}}>Nouvelle catégorie</h2>
          <div style={{marginBottom:'12px'}}>
            <label style={label}>Nom</label>
            <input value={nom} onChange={e => setNom(e.target.value)} required style={input} />
          </div>
          <button type="submit" disabled={loading} style={btn}>+ Ajouter</button>
        </form>

        <form onSubmit={addSousCategory} style={card}>
          <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'16px'}}>Nouvelle sous-catégorie</h2>
          <div style={{marginBottom:'12px'}}>
            <label style={label}>Catégorie parente</label>
            <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} required style={input}>
              <option value="">-- Choisir --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div style={{marginBottom:'12px'}}>
            <label style={label}>Nom</label>
            <input value={nomSous} onChange={e => setNomSous(e.target.value)} required style={input} />
          </div>
          <button type="submit" disabled={loading} style={btn}>+ Ajouter</button>
        </form>
      </div>

      {/* CATEGORIES LIST */}
      <div style={{background:'white',borderRadius:'8px',border:'1px solid #eee',overflow:'hidden',marginBottom:'24px'}}>
        <div style={{padding:'16px 24px',borderBottom:'1px solid #f0f0f0',fontSize:'13px',fontWeight:600,color:'#6E6E6E'}}>
          Catégories ({categories.length})
        </div>
        {categories.length === 0 && <div style={{padding:'24px',textAlign:'center',color:'#6E6E6E',fontSize:'13px'}}>Aucune catégorie</div>}
        {categories.map((cat, i) => (
          <div key={cat.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 24px',borderBottom: i < categories.length-1 ? '1px solid #f0f0f0':'none',gap:'12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              {cat.image_url
                ? <img src={cat.image_url} style={{width:'48px',height:'48px',objectFit:'cover',borderRadius:'4px'}} />
                : <div style={{width:'48px',height:'48px',background:'#f0f0f0',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'#999'}}>IMG</div>
              }
              <span style={{fontSize:'14px'}}>{cat.nom}</span>
            </div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <label style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #003CC7',borderRadius:'4px',color:'#003CC7',cursor:'pointer',whiteSpace:'nowrap'}}>
                {uploadingId === cat.id ? 'Upload...' : '📷 Image'}
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e => e.target.files[0] && uploadImage(cat.id, e.target.files[0], 'categories')} />
              </label>
              <button onClick={() => deleteCategory(cat.id)} style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #ffcccc',borderRadius:'4px',background:'#fff5f5',color:'#cc0000',cursor:'pointer'}}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SOUS-CATEGORIES LIST */}
      <div style={{background:'white',borderRadius:'8px',border:'1px solid #eee',overflow:'hidden'}}>
        <div style={{padding:'16px 24px',borderBottom:'1px solid #f0f0f0',fontSize:'13px',fontWeight:600,color:'#6E6E6E'}}>
          Sous-catégories ({sousCats.length})
        </div>
        {sousCats.length === 0 && <div style={{padding:'24px',textAlign:'center',color:'#6E6E6E',fontSize:'13px'}}>Aucune sous-catégorie</div>}
        {sousCats.map((s, i) => (
          <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 24px',borderBottom: i < sousCats.length-1 ? '1px solid #f0f0f0':'none',gap:'12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              {s.image_url
                ? <img src={s.image_url} style={{width:'48px',height:'48px',objectFit:'cover',borderRadius:'4px'}} />
                : <div style={{width:'48px',height:'48px',background:'#f0f0f0',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'#999'}}>IMG</div>
              }
              <div>
                <div style={{fontSize:'14px'}}>{s.nom}</div>
                <div style={{fontSize:'11px',color:'#6E6E6E',marginTop:'2px'}}>{s.categories?.nom}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <label style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #003CC7',borderRadius:'4px',color:'#003CC7',cursor:'pointer',whiteSpace:'nowrap'}}>
                {uploadingId === s.id ? 'Upload...' : '📷 Image'}
                <input type="file" accept="image/*" style={{display:'none'}} onChange={e => e.target.files[0] && uploadImage(s.id, e.target.files[0], 'sous_categories')} />
              </label>
              <button onClick={() => deleteSousCat(s.id)} style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #ffcccc',borderRadius:'4px',background:'#fff5f5',color:'#cc0000',cursor:'pointer'}}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}