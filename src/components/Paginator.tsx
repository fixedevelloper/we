import Pagination from 'react-bootstrap/Pagination'

/** Pagination Bootstrap pour les pages de l'API (index de page à partir de 0). */
const Paginator = ({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) => {
  if (totalPages <= 1) return null
  const delta = 2
  const start = Math.max(0, page - delta)
  const end = Math.min(totalPages - 1, page + delta)
  const items = []
  for (let n = start; n <= end; n++) {
    items.push(
      <Pagination.Item key={n} active={n === page} onClick={() => onChange(n)}>
        {n + 1}
      </Pagination.Item>,
    )
  }
  return (
    <Pagination className="mb-0 justify-content-end">
      <Pagination.First onClick={() => onChange(0)} disabled={page === 0} />
      <Pagination.Prev onClick={() => onChange(Math.max(0, page - 1))} disabled={page === 0} />
      {start > 0 && <Pagination.Ellipsis disabled />}
      {items}
      {end < totalPages - 1 && <Pagination.Ellipsis disabled />}
      <Pagination.Next onClick={() => onChange(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} />
      <Pagination.Last onClick={() => onChange(totalPages - 1)} disabled={page >= totalPages - 1} />
    </Pagination>
  )
}

export default Paginator
