'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../supabase'
import { useRouter, useParams } from 'next/navigation'

export default function EditProduit() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState({ nom: '', description: '', categorie_id: '', sous_categorie_id: '' })
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [categories, setCategories] = useState([])
  const [sousCats, setSousCats] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const [p, c, s] = await Promise.all([
        supabase.from('produits').select('*').eq('id', id).single(),
        supabase.from('categories').select('*').order('nom'),
        supabase.from('sous_categories').select('*').order('nom'),
      ])
      if (p.data) {
        setForm({ nom: p.data.nom, description: p.data.description || '', categorie_id: p.data.categorie_id || '', sous_categorie_id: p.data.sous_categorie_id || '' })
        setExistingImages(p.data.images || [])
      }
      setCategories(c.data || [])
      setSousCats(s.data || [])
    }
    load()
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    let imageUrls = [...existingImages]

    for (let img of images) {
      const fileName = `${Date.now()}-${img.name}`
      await supabase.storage.from('images').upload(fileName, img)
      const { data } = supabase.storage.from('images').getPublicUrl(fileName)
      imageUrls.push(data.publicUrl)
    }

    await supabase.from('produits').update({ ...form, image_url: imageUrls[0] || '', images: imageUrls }).eq('id', id)
    setLoading(false)
    router.push('/admin/produits')
  }

  async function removeImage(url) {
    setExistingImages(existingImages.filter(i => i !== url))
  }

  const filteredSousCats = sousCats.filter(s => s.categorie_id === form.categorie_id)
  const input = { width:'100%', padding:'10px 14px', border:'1px solid #ddd', borderRadius:'4px', fontSize:'13px', outline:'none', boxSizing:'border-box' }
  const label = { fontSize:'11px', letterSpacing:'.08em', textTransform:'uppercase', color:'#6E6E6E', display:'block', marginBottom:'6px' }

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'32px'}}>
        <a href="/admin/produits" style={{fontSize:'13px',color:'#6E6E6E',textDecoration:'none'}}>← Retour</a>
        <h1 style={{fontSize:'24px',fontWeight:600}}>Modifier le produit</h1>
      </div>

      <form onSubmit={handleSubmit} style={{background:'white',padding:'24px',borderRadius:'8px',border:'1px solid #eee'}}>
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
        </div>

        <div style={{marginBottom:'12px'}}>
          <label style={label}>Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} style={{...input, resize:'vertical'}} />
        </div>

        {existingImages.length > 0 && (
          <div style={{marginBottom:'16px'}}>
            <label style={label}>Images actuelles</label>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {existingImages.map((url, i) => (
                <div key={i} style={{position:'relative'}}>
                  <img src={url} style={{width:'80px',height:'60px',objectFit:'cover',borderRadius:'4px'}} />
                  <button type="button" onClick={() => removeImage(url)} style={{position:'absolute',top:'-6px',right:'-6px',width:'18px',height:'18px',background:'#cc0000',color:'white',border:'none',borderRadius:'50%',fontSize:'10px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{marginBottom:'16px'}}>
          <label style={label}>Ajouter des images</label>
          <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files))} style={{fontSize:'13px'}} />
        </div>

        <div style={{display:'flex',gap:'12px'}}>
          <button type="submit" disabled={loading} style={{background:'#003CC7',color:'white',padding:'10px 24px',border:'none',borderRadius:'4px',fontSize:'13px',cursor:'pointer'}}>
            {loading ? 'Enregistrement...' : 'Sauvegarder'}
          </button>
          <a href="/admin/produits" style={{padding:'10px 24px',border:'1px solid #ddd',borderRadius:'4px',fontSize:'13px',textDecoration:'none',color:'#0C0C0C'}}>
            Annuler
          </a>
        </div>
      </form>
    </div>
  )
}