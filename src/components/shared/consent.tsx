import { Checkbox } from '@/components/ui/checkbox'

export function Consent({ checked, onChange, dark }: { checked: boolean; onChange: (v: boolean) => void; dark?: boolean }) {
  return (
    <Checkbox checked={checked} onChange={onChange} dark={dark} className="text-xs">
      Согласен(на) на обработку персональных данных по{' '}
      <a href="#privacy" className="underline underline-offset-2">
        политике конфиденциальности
      </a>{' '}
      (152-ФЗ)
    </Checkbox>
  )
}
