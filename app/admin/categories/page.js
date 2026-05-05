'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [sousCats, setSousCats] = useState([])
  const [sousSousCats, setSousSousCats] = useState([])
  const [nom, setNom] = useState('')
  const [nomSous, setNomSous] = useState('')
  const [nomSousSous, setNomSousSous] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedSous, setSelectedSous] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingId, setUploadingId] = useState(null)
  const [activeTab, setActiveTab] = useState('categories')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [c, s, ss] = await Promise.all([
      supabase.from('categories').select('*').order('nom'),
      supabase.from('sous_categories').select('*, categories(nom)').order('nom'),
      supabase.from('sous_sous_categories').select('*, sous_categories(nom)').order('nom'),
    ])
    setCategories(c.data || [])
    setSousCats(s.data || [])
    setSousSousCats(ss.data || [])
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

  async function addSousSousCategory(e) {
    e.preventDefault()
    if (!nomSousSous || !selectedSous) return
    setLoading(true)
    await supabase.from('sous_sous_categories').insert({ nom: nomSousSous, sous_categorie_id: selectedSous })
    setNomSousSous('')
    setSelectedSous('')
    setLoading(false)
    loadAll()
  }

  async function deleteItem(table, id) {
    if (!confirm('Supprimer ?')) return
    await supabase.from(table).delete().eq('id', id)
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

  const input = { width:'100%', padding:'10px 14px', border:'1px solid #ddd', borderRadius:'4px', fontSize:'13px', outline:'none', boxSizing:'border-box' }
  const label = { fontSize:'11px', letterSpacing:'.08em', textTransform:'uppercase', color:'#6E6E6E', display:'block', marginBottom:'6px' }
  const btn = { background:'#003CC7', color:'white', padding:'10px 20px', border:'none', borderRadius:'4px', fontSize:'13px', cursor:'pointer' }
  const card = { background:'white', padding:'24px', borderRadius:'8px', border:'1px solid #eee', marginBottom:'24px' }

  const tabs = ['categories', 'sous-categories', 'sous-sous-categories']

  function renderList(items, table, getSubLabel) {
    return (
      <div style={{background:'white',borderRadius:'8px',border:'1px solid #eee',overflow:'hidden'}}>
        <div style={{padding:'16px 24px',borderBottom:'1px solid #f0f0f0',fontSize:'13px',fontWeight:600,color:'#6E6E6E'}}>
          {items.length} élément{items.length > 1 ? 's' : ''}
        </div>
        {items.length === 0 && <div style={{padding:'24px',textAlign:'center',color:'#6E6E6E',fontSize:'13px'}}>Aucun élément</div>}
        {items.map((item, i) => (
          <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 24px',borderBottom: i < items.length-1 ? '1px solid #f0f0f0':'none',gap:'12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              {table !== 'sous_sous_categories' && (
                item.image_url
                  ? <img src={item.image_url} style={{width:'48px',height:'48px',objectFit:'cover',borderRadius:'4px'}} />
                  : <div style={{width:'48px',height:'48px',background:'#f0f0f0',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'#999'}}>IMG</div>
              )}
              <div>
                <div style={{fontSize:'14px'}}>{item.nom}</div>
                {getSubLabel && <div style={{fontSize:'11px',color:'#6E6E6E',marginTop:'2px'}}>{getSubLabel(item)}</div>}
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              {table !== 'sous_sous_categories' && (
                <label style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #003CC7',borderRadius:'4px',color:'#003CC7',cursor:'pointer',whiteSpace:'nowrap'}}>
                  {uploadingId === item.id ? 'Upload...' : '📷 Image'}
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e => e.target.files[0] && uploadImage(item.id, e.target.files[0], table)} />
                </label>
              )}
              <button onClick={() => deleteItem(table, item.id)} style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #ffcccc',borderRadius:'4px',background:'#fff5f5',color:'#cc0000',cursor:'pointer'}}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h1 style={{fontSize:'24px',fontWeight:600,marginBottom:'8px'}}>Catégories</h1>
      <p style={{fontSize:'13px',color:'#6E6E6E',marginBottom:'24px'}}>Gérer les catégories, sous-catégories et sous-sous-catégories</p>

      {/* TABS */}
      <div style={{display:'flex',gap:'2px',marginBottom:'28px',background:'#f0f0f0',padding:'4px',borderRadius:'6px',width:'fit-content'}}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{padding:'8px 16px',border:'none',borderRadius:'4px',fontSize:'12px',cursor:'pointer',fontFamily:'var(--sans)',background:activeTab===t?'white':'transparent',color:activeTab===t?'#003CC7':'#6E6E6E',fontWeight:activeTab===t?600:400,boxShadow:activeTab===t?'0 1px 3px rgba(0,0,0,.1)':'none'}}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div>
          <form onSubmit={addCategory} style={card}>
            <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'16px'}}>Nouvelle catégorie</h2>
            <div style={{display:'flex',gap:'12px'}}>
              <div style={{flex:1}}>
                <label style={label}>Nom</label>
                <input value={nom} onChange={e => setNom(e.target.value)} required style={input} />
              </div>
              <div style={{display:'flex',alignItems:'flex-end'}}>
                <button type="submit" disabled={loading} style={btn}>+ Ajouter</button>
              </div>
            </div>
          </form>
          {renderList(categories, 'categories', null)}
        </div>
      )}

      {/* SOUS-CATEGORIES TAB */}
      {activeTab === 'sous-categories' && (
        <div>
          <form onSubmit={addSousCategory} style={card}>
            <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'16px'}}>Nouvelle sous-catégorie</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'12px',alignItems:'flex-end'}}>
              <div>
                <label style={label}>Catégorie parente</label>
                <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} required style={input}>
                  <option value="">-- Choisir --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Nom</label>
                <input value={nomSous} onChange={e => setNomSous(e.target.value)} required style={input} />
              </div>
              <button type="submit" disabled={loading} style={btn}>+ Ajouter</button>
            </div>
          </form>
          {renderList(sousCats, 'sous_categories', item => item.categories?.nom)}
        </div>
      )}

      {/* SOUS-SOUS-CATEGORIES TAB */}
      {activeTab === 'sous-sous-categories' && (
        <div>
          <form onSubmit={addSousSousCategory} style={card}>
            <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'16px'}}>Nouvelle sous-sous-catégorie</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'12px',alignItems:'flex-end'}}>
              <div>
                <label style={label}>Sous-catégorie parente</label>
                <select value={selectedSous} onChange={e => setSelectedSous(e.target.value)} required style={input}>
                  <option value="">-- Choisir --</option>
                  {sousCats.map(s => <option key={s.id} value={s.id}>{s.nom} ({s.categories?.nom})</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Nom</label>
                <input value={nomSousSous} onChange={e => setNomSousSous(e.target.value)} required style={input} />
              </div>
              <button type="submit" disabled={loading} style={btn}>+ Ajouter</button>
            </div>
          </form>
          {renderList(sousSousCats, 'sous_sous_categories', item => item.sous_categories?.nom)}
        </div>
      )}
    </div>
  )
}
