'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ produits: 0, categories: 0, realisations: 0 })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/admin/login')
    })
    async function loadStats() {
      const [p, c, r] = await Promise.all([
        supabase.from('produits').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('realisations').select('*', { count: 'exact', head: true }),
      ])
      setStats({ produits: p.count || 0, categories: c.count || 0, realisations: r.count || 0 })
    }
    loadStats()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
        <div>
          <h1 style={{fontSize:'24px',fontWeight:600,color:'#0C0C0C'}}>Dashboard</h1>
          <p style={{fontSize:'13px',color:'#6E6E6E',marginTop:'4px'}}>Bienvenue sur votre panel admin</p>
        </div>
        <button onClick={handleLogout} style={{fontSize:'12px',padding:'8px 16px',border:'1px solid #ddd',background:'white',cursor:'pointer',borderRadius:'4px',color:'#6E6E6E'}}>
          Déconnexion
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'32px'}}>
        {[
          { label: 'Produits', value: stats.produits, link: '/admin/produits' },
          { label: 'Catégories', value: stats.categories, link: '/admin/categories' },
          { label: 'Réalisations', value: stats.realisations, link: '/admin/realisations' },
        ].map(s => (
          <a key={s.label} href={s.link} style={{textDecoration:'none',background:'white',padding:'24px',borderRadius:'8px',border:'1px solid #eee',display:'block'}}>
            <div style={{fontSize:'32px',fontWeight:700,color:'#003CC7'}}>{s.value}</div>
            <div style={{fontSize:'13px',color:'#6E6E6E',marginTop:'4px'}}>{s.label}</div>
          </a>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px'}}>
        {[
          { label: 'Ajouter un produit', link: '/admin/produits/nouveau', desc: 'Créer une nouvelle fiche produit' },
          { label: 'Ajouter une catégorie', link: '/admin/categories/nouveau', desc: 'Créer une catégorie ou sous-catégorie' },
          { label: 'Ajouter une réalisation', link: '/admin/realisations/nouveau', desc: 'Publier un nouveau projet' },
        ].map(a => (
          <a key={a.label} href={a.link} style={{textDecoration:'none',background:'#003CC7',padding:'24px',borderRadius:'8px',display:'block'}}>
            <div style={{fontSize:'14px',fontWeight:600,color:'white',marginBottom:'6px'}}>+ {a.label}</div>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,.6)'}}>{a.desc}</div>
          </a>
        ))}
      </div>
    </div>
  )
}