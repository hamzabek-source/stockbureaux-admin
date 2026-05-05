'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export default function Realisations() {
  const [realisations, setRealisations] = useState([])
  const [form, setForm] = useState({ titre: '', description: '', ville: '', surface: '', annee: '' })
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])

  useEffect(() => { loadRealisations() }, [])

  async function loadRealisations() {
    const { data } = await supabase.from('realisations').select('*').order('created_at', { ascending: false })
    setRealisations(data || [])
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

    await supabase.from('realisations').insert({ ...form, image_url: imageUrls[0] || '', images: imageUrls })
    setForm({ titre: '', description: '', ville: '', surface: '', annee: '' })
    setImages([])
    setLoading(false)
    loadRealisations()
  }

  async function deleteRealisation(id) {
    if (!confirm('Supprimer cette réalisation ?')) return
    await supabase.from('realisations').delete().eq('id', id)
    loadRealisations()
  }

  return (
    <div>
      <h1 style={{fontSize:'24px',fontWeight:600,marginBottom:'8px'}}>Réalisations</h1>
      <p style={{fontSize:'13px',color:'#6E6E6E',marginBottom:'32px'}}>Gérer les projets affichés sur le site</p>

      <form onSubmit={handleSubmit} style={{background:'white',padding:'24px',borderRadius:'8px',border:'1px solid #eee',marginBottom:'24px'}}>
        <h2 style={{fontSize:'16px',fontWeight:600,marginBottom:'16px'}}>Nouvelle réalisation</h2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
          {[
            { key:'titre', label:'Titre', required:true },
            { key:'ville', label:'Ville' },
            { key:'surface', label:'Surface (ex: 1200 m²)' },
            { key:'annee', label:'Année' },
          ].map(f => (
            <div key={f.key}>
              <label style={{fontSize:'11px',letterSpacing:'.08em',textTransform:'uppercase',color:'#6E6E6E',display:'block',marginBottom:'6px'}}>{f.label}</label>
              <input
                value={form[f.key]}
                onChange={e => setForm({...form, [f.key]: e.target.value})}
                required={f.required}
                style={{width:'100%',padding:'10px 14px',border:'1px solid #ddd',borderRadius:'4px',fontSize:'13px',outline:'none',boxSizing:'border-box'}}
              />
            </div>
          ))}
        </div>
        <div style={{marginBottom:'12px'}}>
          <label style={{fontSize:'11px',letterSpacing:'.08em',textTransform:'uppercase',color:'#6E6E6E',display:'block',marginBottom:'6px'}}>Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            rows={3}
            style={{width:'100%',padding:'10px 14px',border:'1px solid #ddd',borderRadius:'4px',fontSize:'13px',outline:'none',boxSizing:'border-box',resize:'vertical'}}
          />
        </div>
        <div style={{marginBottom:'16px'}}>
          <label style={{fontSize:'11px',letterSpacing:'.08em',textTransform:'uppercase',color:'#6E6E6E',display:'block',marginBottom:'6px'}}>Images (plusieurs possibles)</label>
          <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files))} style={{fontSize:'13px'}} />
          {images.length > 0 && (
            <div style={{marginTop:'8px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {images.map((img, i) => (
                <div key={i} style={{fontSize:'11px',background:'#f0f0f0',padding:'4px 8px',borderRadius:'4px',color:'#6E6E6E'}}>
                  {img.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={loading} style={{background:'#003CC7',color:'white',padding:'10px 24px',border:'none',borderRadius:'4px',fontSize:'13px',cursor:'pointer'}}>
          {loading ? 'Enregistrement...' : '+ Ajouter'}
        </button>
      </form>

      <div style={{background:'white',borderRadius:'8px',border:'1px solid #eee',overflow:'hidden'}}>
        {realisations.length === 0 && (
          <div style={{padding:'32px',textAlign:'center',color:'#6E6E6E',fontSize:'13px'}}>Aucune réalisation</div>
        )}
        {realisations.map((r, i) => (
          <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderBottom: i < realisations.length-1 ? '1px solid #f0f0f0':'none',gap:'16px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
              {r.image_url && <img src={r.image_url} style={{width:'60px',height:'45px',objectFit:'cover',borderRadius:'4px'}} />}
              <div>
                <div style={{fontSize:'14px',fontWeight:500,color:'#0C0C0C'}}>{r.titre}</div>
                <div style={{fontSize:'12px',color:'#6E6E6E',marginTop:'2px'}}>{r.ville} {r.annee && `· ${r.annee}`} {r.surface && `· ${r.surface}`}</div>
                {r.images && r.images.length > 1 && (
                  <div style={{fontSize:'11px',color:'#003CC7',marginTop:'2px'}}>{r.images.length} images</div>
                )}
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',flexShrink:0}}>
              <a href={`/admin/realisations/${r.id}`} style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #ddd',borderRadius:'4px',textDecoration:'none',color:'#0C0C0C'}}>
                Modifier
              </a>
              <button onClick={() => deleteRealisation(r.id)} style={{fontSize:'12px',padding:'6px 12px',border:'1px solid #ffcccc',borderRadius:'4px',background:'#fff5f5',color:'#cc0000',cursor:'pointer'}}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}