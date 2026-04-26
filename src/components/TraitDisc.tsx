type Trait = 'O' | 'C' | 'E' | 'A' | 'N'

interface TraitDiscProps {
  trait: Trait
  size?: number
}

export default function TraitDisc({ trait, size = 10 }: TraitDiscProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `var(--trait-${trait})`,
        flexShrink: 0,
      }}
    />
  )
}
