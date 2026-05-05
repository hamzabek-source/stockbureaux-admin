'use client'
import { useRouter } from 'next/navigation'

export default function NouvelleCategorie() {
  const router = useRouter()
  router.push('/admin/categories')
  return null
}