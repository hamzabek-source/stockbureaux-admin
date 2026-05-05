export default function AdminLayout({ children }) {
  return (
    <div style={{display:'flex',minHeight:'100vh',fontFamily:'DM Sans, sans-serif'}}>
      <aside style={{width:'220px',background:'#0C0C0C',padding:'32px 0',display:'flex',flexDirection:'column',gap:'4px',flexShrink:0}}>
        <div style={{padding:'0 24px 32px',borderBottom:'1px solid rgba(255,255,255,.08)',marginBottom:'16px'}}>
          <div style={{fontFamily:'Cormorant Garamond, serif',fontSize:'18px',fontWeight:600,color:'white'}}>
            Stock<span style={{color:'#003CC7'}}>.</span>Bureaux
          </div>
          <div style={{fontSize:'10px',letterSpacing:'.15em',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginTop:'4px'}}>Admin</div>
        </div>
        <a href="/admin/dashboard" style={{padding:'10px 24px',fontSize:'13px',color:'rgba(255,255,255,.6)',textDecoration:'none',display:'block'}}>🏠 Dashboard</a>
        <a href="/admin/categories" style={{padding:'10px 24px',fontSize:'13px',color:'rgba(255,255,255,.6)',textDecoration:'none',display:'block'}}>📁 Catégories</a>
        <a href="/admin/produits" style={{padding:'10px 24px',fontSize:'13px',color:'rgba(255,255,255,.6)',textDecoration:'none',display:'block'}}>🪑 Produits</a>
        <a href="/admin/realisations" style={{padding:'10px 24px',fontSize:'13px',color:'rgba(255,255,255,.6)',textDecoration:'none',display:'block'}}>🏢 Réalisations</a>
      </aside>
      <main style={{flex:1,background:'#F8F6F1',padding:'40px'}}>
        {children}
      </main>
    </div>
  )
}