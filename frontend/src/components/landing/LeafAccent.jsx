// Static, very faint line drawing of a leafy branch used as a background accent. Not animated.
export default function LeafAccent({ className = '' }) {
  return (
    <svg viewBox="0 0 400 520" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`pointer-events-none select-none ${className}`}>
      <path d="M200 520 C198 400 208 270 262 110" />
      {/* leaves on the left */}
      <path d="M203 430 C140 418 100 372 108 322 C172 330 212 372 203 430Z" />
      <path d="M108 322 C140 345 175 385 203 430" />
      <path d="M212 330 C150 312 118 262 130 214 C190 226 226 272 212 330Z" />
      <path d="M130 214 C160 240 192 285 212 330" />
      <path d="M236 228 C190 206 170 160 186 118 C236 132 252 180 236 228Z" />
      {/* leaves on the right */}
      <path d="M205 390 C262 372 320 380 350 424 C292 442 232 432 205 390Z" />
      <path d="M350 424 C300 410 244 400 205 390" />
      <path d="M222 290 C280 266 336 270 372 312 C314 336 254 330 222 290Z" />
      <path d="M372 312 C320 300 262 292 222 290" />
      <path d="M248 186 C298 160 346 164 372 200 C322 224 272 220 248 186Z" />
    </svg>
  )
}
