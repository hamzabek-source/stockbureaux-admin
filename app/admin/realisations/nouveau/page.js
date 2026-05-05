'use client'
import { useRouter } from 'next/navigation'

export default function NouveauProduit() {
  const router = useRouter()
  router.push('/admin/produits')
  return null
}