'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function NouvelleRealisation() {
  const router = useRouter()
  useEffect(() => { router.push('/admin/realisations') }, [])
  return null
}