'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export default function Realisations() {
  const [realisations, setRealisations] = useState([])
  const [form, setForm] = useState({ titre: '', description: '', ville: '', surface: '', annee: '' })
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])

  useEffect(() => { loadRealisations() }, [])

  async function loadRealisations() {
    const { data } = await supabase.from('realisations').select('*').order('created_at', { ascending: false })
    setRealisations(data || [])
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files)
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
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
    await supabase.from('realisations').insert({ ...form, image_url: imageUrls[0] || '', images: imageUrls })
    setForm({ titre: '', description: '', ville: '', surface: '', annee: '' })
    setImages([])
    setPreviews([])
    setLoading(false)
    loadRealisations()
  }

  async function deleteRealisation(id) {
    if (!confirm('Supprimer cette réalisation ?')) return
    await supabase.from('realisations').delete().eq('id', id)
    loadRealisations()
  }

  const input = { width:'100%', padding:'10px 14px', border:'1px solid #ddd', borderRadius:'4px', fontSize:'13px', outline:'none', boxSizing:'border-box' }
  const labelStyle = { fontSize:'11px', letterSpacing:'.08em', textTransform:'uppercase', color:'#6E6E6E', display:'block', marginBottom:'6px' }

  return (
    <div>
      <h1 style={{fontSize:'24px',fontWeight:600,marginBottom:'8px'}}>Réalisations</h1>
      <p style={{fontSize:'13px',color:'#6E6E6E',marginBottom:'32px'}}>Gérer les projets affichés sur le site</p>

      <form onSubmit={handleSubmit} style={{background:'white',padding:'24px',borderRadius:'8px',border:'1px solid #eee',marginBottom:'24px'}}>
        <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'16px'}}>Nouvelle réalisation</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
          {[
            { key:'titre', label:'Titre *', required:true },
            { key:'ville', label:'Ville' },
            { key:'surface', label:'Surface (ex: 1200 m²)' },
            { key:'annee', label:'Année' },
          ].map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} required={f.required} style={input} />
            </div>
          ))}
        </div>
        <div style={{marginBottom:'16px'}}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} style={{...input, resize:'vertical'}} />
        </div>

        {/* IMAGE UPLOAD BUTTON */}
        <div style={{marginBottom:'16px'}}>
          <label style={labelStyle}>Images * (plusieurs possibles)</label>
          <label style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'10px 20px',background:'#003CC7',color:'white',borderRadius:'4px',cursor:'pointer',fontSize:'13px',fontWeight:500}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Choisir des images
            <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{display:'none'}} required={images.length === 0} />
          </label>
          {previews.length > 0 && (
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'12px'}}>
              {previews.map((src, i) => (
                <div key={i} style={{position:'relative'}}>
                  <img src={src} style={{width:'72px',height:'72px',objectFit:'cover',borderRadius:'4px',border:'1px solid #eee'}} />
                  <div style={{position:'absolute',top:'-6px',right:'-6px',background:'#003CC7',color:'white',borderRadius:'50%',width:'18px',height:'18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',cursor:'pointer'}} onClick={() => {
                    const newImgs = images.filter((_,j) => j !== i)
                    const newPrevs = previews.filter((_,j) => j !== i)
                    setImages(newImgs)
                    setPreviews(newPrevs)
                  }}>×</div>
                </div>
              ))}
            </div>
          )}
          {images.length > 0 && <div style={{fontSize:'12px',color:'#6E6E6E',marginTop:'6px'}}>{images.length} image{images.length > 1 ? 's' : ''} sélectionnée{images.length > 1 ? 's' : ''}</div>}
        </div>

        <button type="submit" disabled={loading} style={{background:'#003CC7',color:'white',padding:'10px 24px',border:'none',borderRadius:'4px',fontSize:'13px',cursor:'pointer'}}>
          {loading ? 'Enregistrement...' : '+ Ajouter'}
        </button>
      </form>

      <div style={{background:'white',borderRadius:'8px',border:'1px solid #eee',overflow:'hidden'}}>
        {realisations.length === 0 && <div style={{padding:'32px',textAlign:'center',color:'#6E6E6E',fontSize:'13px'}}>Aucune réalisation</div>}
        {realisations.map((r, i) => (
          <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderBottom: i < realisations.length-1 ? '1px solid #f0f0f0':'none',gap:'16px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
              {r.image_url && <img src={r.image_url} style={{width:'60px',height:'45px',objectFit:'cover',borderRadius:'4px'}} />}
              <div>
                <div style={{fontSize:'14px',fontWeight:500,color:'#0C0C0C'}}>{r.titre}</div>
                <div style={{fontSize:'12px',color:'#6E6E6E',marginTop:'2px'}}>{r.ville} {r.annee && `· ${r.annee}`} {r.surface && `· ${r.surface}`}</div>
                {r.images && r.images.length > 1 && <div style={{fontSize:'11px',color:'#003CC7',marginTop:'2px'}}>{r.images.length} images</div>}
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',flexShrink:0}}>
              <a href={`/admin/realisations/${r.id}`} style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #ddd',borderRadius:'4px',textDecoration:'none',color:'#0C0C0C'}}>Modifier</a>
              <button onClick={() => deleteRealisation(r.id)} style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #ffcccc',borderRadius:'4px',background:'#fff5f5',color:'#cc0000',cursor:'pointer'}}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
