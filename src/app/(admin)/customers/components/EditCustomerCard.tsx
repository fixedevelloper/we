'use client'
import React, { useEffect, useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import API_ENDPOINTS from '@/app/(other)/api/Constant'
import { useFetchData } from '@/hooks/useFetchData'
import { useApi } from '@/hooks/useApi'
import { useNotificationContext } from '@/context/useNotificationContext'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Spinner from '@/components/Spinner'
import { ApiError } from '@/lib/api/http'

type AdminCustomer = { id: string; displayName?: string; firstName?: string; lastName?: string; businessName?: string; status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED' }

/**
 * Le profil d'un client est modifié par le client lui-même (application) : le back-office ne change que le statut du
 * compte (suspension, réactivation, clôture), avec un motif conservé dans le journal d'audit.
 */
const EditCustomerCard: React.FC<{ customerId: string }> = ({ customerId }) => {
  const api = useApi()
  const { showNotification } = useNotificationContext()
  const { data, loading, refetch } = useFetchData<AdminCustomer>(`${API_ENDPOINTS.CUSTOMERS}/${customerId}`)
  const [status, setStatus] = useState<string>('ACTIVE')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (data) setStatus(data.status)
  }, [data])

  if (loading && !data) {
    return (
      <div className="text-center my-5">
        <Spinner type="border" color="primary" />
      </div>
    )
  }
  if (!data) return <p className="text-center text-muted mt-4">Aucun client trouvé.</p>

  const save = async () => {
    setBusy(true)
    try {
      await api.patch(`${API_ENDPOINTS.CUSTOMERS}/${customerId}`, { status, reason: reason || undefined })
      showNotification({ message: 'Statut du compte mis à jour', variant: 'success' })
      setReason('')
      await refetch()
    } catch (e) {
      showNotification({ message: e instanceof ApiError ? e.fullMessage : 'Erreur inattendue', variant: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>Statut du compte</Form.Label>
          <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ACTIVE">Actif</option>
            <option value="SUSPENDED">Suspendu (aucun envoi possible)</option>
            <option value="CLOSED">Clos</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Motif (conservé dans l'audit)</Form.Label>
          <Form.Control value={reason} onChange={(e) => setReason(e.target.value)} />
        </Form.Group>
        <div className="text-center">
          <Button variant="primary" disabled={busy || status === data.status} onClick={save}>
            <IconifyIcon icon="ri:edit-2-line" className="me-1" />
            Enregistrer
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default EditCustomerCard
