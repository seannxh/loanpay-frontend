import { useEffect, useRef } from 'react'
// keep latest onDone without restarting the animation effect

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}

const COLORS = ['#aa3bff', '#ff3b9a', '#ffd23b', '#3bd1ff', '#3bff7a', '#ff7a3b']

// A self-contained canvas firework overlay. Bursts for ~2.2s, then calls
// onDone() once all particles have faded so the parent can unmount it.
export function Fireworks({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let particles: Particle[] = []
    const burst = (x: number, y: number) => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const count = 60
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count
        const speed = 2 + Math.random() * 4
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color,
        })
      }
    }

    let raf = 0
    let frame = 0
    const start = performance.now()
    const loop = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (frame % 18 === 0 && t - start < 2200) {
        burst(
          canvas.width * (0.2 + Math.random() * 0.6),
          canvas.height * (0.15 + Math.random() * 0.4),
        )
      }
      frame++
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.04 // gravity
        p.life -= 0.012
      }
      particles = particles.filter((p) => p.life > 0)
      for (const p of particles) {
        ctx.globalAlpha = Math.max(p.life, 0)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      if (t - start < 3600 || particles.length > 0) {
        raf = requestAnimationFrame(loop)
      } else {
        onDoneRef.current()
      }
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden="true" />
}
