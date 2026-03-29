/**
 * Generates full-page SVG strings (595×842 A4) for each background pattern.
 * Mirrors the web SchoolPattern / KindergartenPattern / TeensPattern components.
 * Used to rasterize via sharp → PNG buffer → PDF page background.
 */

// ── School pattern ─────────────────────────────────────────────────────────

function schoolPatternContent(): string {
  // Ruler long ticks
  const tickXs = [175, 195, 215, 235, 255, 275, 295, 315, 335, 355, 375, 395]
  const ticks = tickXs.map((x, i) =>
    `<line x1="${x}" y1="203" x2="${x}" y2="${i % 2 === 0 ? 215 : 211}" stroke="#29B6F6" stroke-width="1.2"/>`
  ).join('')
  const nums = [175, 215, 255, 295, 335, 375].map((x, i) =>
    `<text x="${x - 2}" y="228" font-size="8" fill="#29B6F6" font-family="sans-serif">${i + 1}</text>`
  ).join('')

  return `
    <!-- YELLOW PENCIL -->
    <g transform="rotate(-28, 88, 155)">
      <rect x="74" y="42" width="28" height="16" rx="3" fill="#FFAACC"/>
      <rect x="74" y="57" width="28" height="7" fill="#C0C0C0"/>
      <rect x="74" y="64" width="28" height="130" fill="#FFD740"/>
      <line x1="88" y1="64" x2="88" y2="194" stroke="#E8B800" stroke-width="1.5" opacity="0.4"/>
      <polygon points="74,194 102,194 88,222" fill="#D4A870"/>
      <polygon points="82,212 94,212 88,222" fill="#444"/>
    </g>
    <!-- RULER -->
    <g transform="rotate(6, 285, 215)">
      <rect x="155" y="203" width="260" height="30" rx="4" fill="#B3E5FC" stroke="#4FC3F7" stroke-width="1.5"/>
      ${ticks}
      ${nums}
    </g>
    <!-- TRIANGLE -->
    <g transform="rotate(-10, 420, 108)">
      <polygon points="390,55 470,185 310,185" fill="rgba(255,152,0,0.12)" stroke="#FFA726" stroke-width="2.5" stroke-linejoin="round"/>
      <polyline points="317,177 317,163 331,163" fill="none" stroke="#FFA726" stroke-width="1.5"/>
    </g>
    <!-- RED CRAYON -->
    <g transform="rotate(18, 440, 355)">
      <rect x="428" y="282" width="22" height="8" rx="2" fill="#E0E0E0"/>
      <rect x="430" y="290" width="18" height="5" rx="1" fill="#B71C1C"/>
      <rect x="430" y="295" width="18" height="90" fill="#EF5350"/>
      <rect x="428" y="330" width="22" height="35" rx="1" fill="#C62828"/>
      <rect x="430" y="385" width="18" height="25" fill="#EF5350"/>
      <polygon points="430,410 448,410 439,430" fill="#FF8A65"/>
    </g>
    <!-- INDIGO PENCIL -->
    <g transform="rotate(16, 130, 400)">
      <rect x="118" y="325" width="24" height="14" rx="3" fill="#CE93D8"/>
      <rect x="118" y="339" width="24" height="6" fill="#9E9E9E"/>
      <rect x="118" y="345" width="24" height="110" fill="#7986CB"/>
      <line x1="130" y1="345" x2="130" y2="455" stroke="#5C6BC0" stroke-width="1.5" opacity="0.4"/>
      <polygon points="118,455 142,455 130,480" fill="#BCAAA4"/>
      <polygon points="125,470 135,470 130,480" fill="#333"/>
    </g>
    <!-- GREEN CRAYON -->
    <g transform="rotate(-22, 285, 420)">
      <rect x="273" y="370" width="22" height="8" rx="2" fill="#E0E0E0"/>
      <rect x="275" y="378" width="18" height="5" rx="1" fill="#1B5E20"/>
      <rect x="275" y="383" width="18" height="80" fill="#4CAF50"/>
      <rect x="273" y="415" width="22" height="28" rx="1" fill="#388E3C"/>
      <polygon points="275,463 293,463 284,482" fill="#81C784"/>
    </g>
    <!-- ERASER -->
    <g transform="rotate(-14, 360, 455)">
      <rect x="305" y="442" width="80" height="34" rx="6" fill="#F48FB1"/>
      <rect x="305" y="442" width="80" height="9" rx="4" fill="#E91E8C"/>
    </g>
    <!-- STARS -->
    <g transform="translate(252, 65)"><polygon points="0,-15 4,-6 13,-6 6,0 9,11 0,5.5 -9,11 -6,0 -13,-6 -4,-6" fill="#FFD740"/></g>
    <g transform="translate(490, 285) rotate(12)"><polygon points="0,-12 3,-5 11,-5 5,0.5 7.5,9 0,4.5 -7.5,9 -5,0.5 -11,-5 -3,-5" fill="#FFD740"/></g>
    <g transform="translate(55, 295) rotate(-8)"><polygon points="0,-11 3,-4 10,-4 4.5,0.5 7,8.5 0,4 -7,8.5 -4.5,0.5 -10,-4 -3,-4" fill="#FFEE58"/></g>
    <g transform="translate(390, 510) rotate(5)"><polygon points="0,-10 2.5,-3.5 9,-3.5 4,0.5 6,8 0,3.5 -6,8 -4,0.5 -9,-3.5 -2.5,-3.5" fill="#FFD740"/></g>
    <!-- PAINT BLOBS -->
    <circle cx="230" cy="345" r="9" fill="#66BB6A"/>
    <circle cx="248" cy="356" r="6" fill="#EF5350"/>
    <circle cx="217" cy="358" r="7" fill="#42A5F5"/>
    <circle cx="238" cy="367" r="5" fill="#FFA726"/>
    <!-- SMALL TRIANGLE -->
    <g transform="rotate(5, 310, 90)">
      <polygon points="310,45 360,135 260,135" fill="rgba(130,200,255,0.15)" stroke="#81D4FA" stroke-width="2" stroke-linejoin="round"/>
    </g>
    <!-- PENCIL SHAVINGS -->
    <g transform="translate(475, 100) rotate(-20)" opacity="0.6">
      <path d="M 0,0 Q 10,8 0,16 Q -8,24 0,32" fill="none" stroke="#FFD740" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 6,0 Q 16,8 6,16 Q -2,24 6,32" fill="none" stroke="#D4A870" stroke-width="1.5" stroke-linecap="round"/>
    </g>
  `
}

// ── Kindergarten pattern ────────────────────────────────────────────────────

function kinderPatternContent(): string {
  // Sun rays
  const sunAngles = [0, 45, 90, 135, 180, 225, 270, 315]
  const rays = sunAngles.map(angle => {
    const rad = (angle * Math.PI) / 180
    return `<line x1="${(Math.cos(rad) * 38).toFixed(2)}" y1="${(Math.sin(rad) * 38).toFixed(2)}" x2="${(Math.cos(rad) * 56).toFixed(2)}" y2="${(Math.sin(rad) * 56).toFixed(2)}" stroke="#FFD740" stroke-width="5" stroke-linecap="round"/>`
  }).join('')

  // Flower petals
  const flowerAngles = [0, 60, 120, 180, 240, 300]
  const petals = flowerAngles.map(angle => {
    const rad = (angle * Math.PI) / 180
    const cx = (Math.cos(rad) * 19).toFixed(2)
    const cy = (Math.sin(rad) * 19 - 14).toFixed(2)
    return `<ellipse cx="${cx}" cy="${cy}" rx="9" ry="15" fill="#FF7043" transform="rotate(${angle},${cx},${cy})"/>`
  }).join('')

  return `
    <!-- SUN -->
    <g transform="translate(75, 75)">
      ${rays}
      <circle cx="0" cy="0" r="32" fill="#FFD740"/>
      <circle cx="-10" cy="-6" r="4.5" fill="#FF8F00"/>
      <circle cx="10" cy="-6" r="4.5" fill="#FF8F00"/>
      <path d="M -10,8 Q 0,18 10,8" fill="none" stroke="#FF8F00" stroke-width="3" stroke-linecap="round"/>
    </g>
    <!-- CLOUD 1 -->
    <g transform="translate(390, 55)">
      <circle cx="0" cy="16" r="16" fill="#FFFFFF"/>
      <circle cx="22" cy="6" r="22" fill="#FFFFFF"/>
      <circle cx="50" cy="10" r="20" fill="#FFFFFF"/>
      <circle cx="74" cy="16" r="16" fill="#FFFFFF"/>
      <circle cx="-14" cy="20" r="13" fill="#FFFFFF"/>
      <rect x="-14" y="18" width="102" height="20" fill="#FFFFFF"/>
    </g>
    <!-- SMALL CLOUD -->
    <g transform="translate(220, 90)">
      <circle cx="0" cy="10" r="12" fill="#FFFFFF"/>
      <circle cx="17" cy="2" r="16" fill="#FFFFFF"/>
      <circle cx="37" cy="8" r="13" fill="#FFFFFF"/>
      <circle cx="52" cy="13" r="10" fill="#FFFFFF"/>
      <rect x="0" y="12" width="62" height="14" fill="#FFFFFF"/>
    </g>
    <!-- TOY CAR -->
    <g transform="translate(25, 355)">
      <rect x="0" y="32" width="135" height="52" rx="14" fill="#FF7043"/>
      <rect x="28" y="6" width="78" height="38" rx="10" fill="#FF8A65"/>
      <rect x="35" y="12" width="64" height="26" rx="7" fill="#B3E5FC"/>
      <rect x="38" y="40" width="44" height="28" rx="6" fill="#FF6E40"/>
      <circle cx="76" cy="55" r="3.5" fill="#FFD740"/>
      <ellipse cx="129" cy="52" rx="8" ry="6" fill="#FFF9C4"/>
      <circle cx="32" cy="84" r="22" fill="#37474F"/>
      <circle cx="32" cy="84" r="11" fill="#78909C"/>
      <circle cx="32" cy="84" r="4" fill="#B0BEC5"/>
      <circle cx="106" cy="84" r="22" fill="#37474F"/>
      <circle cx="106" cy="84" r="11" fill="#78909C"/>
      <circle cx="106" cy="84" r="4" fill="#B0BEC5"/>
    </g>
    <!-- TEDDY BEAR -->
    <g transform="translate(272, 230)">
      <circle cx="-30" cy="-10" r="18" fill="#BCAAA4"/>
      <circle cx="-30" cy="-10" r="10" fill="#A1887F"/>
      <circle cx="30" cy="-10" r="18" fill="#BCAAA4"/>
      <circle cx="30" cy="-10" r="10" fill="#A1887F"/>
      <circle cx="0" cy="0" r="38" fill="#BCAAA4"/>
      <circle cx="-13" cy="-9" r="7" fill="#4E342E"/>
      <circle cx="13" cy="-9" r="7" fill="#4E342E"/>
      <circle cx="-11" cy="-11" r="2.5" fill="#FFFFFF"/>
      <circle cx="15" cy="-11" r="2.5" fill="#FFFFFF"/>
      <ellipse cx="0" cy="14" rx="15" ry="10" fill="#A1887F"/>
      <ellipse cx="0" cy="9" rx="7" ry="5" fill="#4E342E"/>
      <path d="M -6,16 Q 0,23 6,16" fill="none" stroke="#4E342E" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="0" cy="74" rx="33" ry="42" fill="#BCAAA4"/>
      <ellipse cx="0" cy="74" rx="18" ry="24" fill="#A1887F"/>
      <ellipse cx="-40" cy="62" rx="12" ry="27" fill="#BCAAA4" transform="rotate(-18,-40,62)"/>
      <ellipse cx="40" cy="62" rx="12" ry="27" fill="#BCAAA4" transform="rotate(18,40,62)"/>
      <ellipse cx="-18" cy="108" rx="14" ry="20" fill="#BCAAA4"/>
      <ellipse cx="18" cy="108" rx="14" ry="20" fill="#BCAAA4"/>
      <polygon points="-16,36 -2,43 -16,50" fill="#FF8A80"/>
      <polygon points="16,36 2,43 16,50" fill="#FF8A80"/>
      <circle cx="0" cy="43" r="6" fill="#FF5252"/>
    </g>
    <!-- RAINBOW -->
    <path d="M 372,482 A 78,78 0 0,0 528,482" fill="none" stroke="#9C27B0" stroke-width="9" stroke-linecap="round"/>
    <path d="M 380,482 A 70,70 0 0,0 520,482" fill="none" stroke="#2196F3" stroke-width="9" stroke-linecap="round"/>
    <path d="M 388,482 A 62,62 0 0,0 512,482" fill="none" stroke="#4CAF50" stroke-width="9" stroke-linecap="round"/>
    <path d="M 396,482 A 54,54 0 0,0 504,482" fill="none" stroke="#FFEB3B" stroke-width="9" stroke-linecap="round"/>
    <path d="M 404,482 A 46,46 0 0,0 496,482" fill="none" stroke="#FF9800" stroke-width="9" stroke-linecap="round"/>
    <path d="M 412,482 A 38,38 0 0,0 488,482" fill="none" stroke="#F44336" stroke-width="9" stroke-linecap="round"/>
    <!-- BALLOONS -->
    <g transform="translate(425, 295)">
      <ellipse cx="0" cy="0" rx="24" ry="29" fill="#FF80AB"/>
      <polygon points="-5,29 5,29 0,38" fill="#FF4081"/>
      <path d="M 0,38 Q 8,55 -4,72 Q 6,89 0,105" fill="none" stroke="#FF4081" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="-7" cy="-11" rx="7" ry="5" fill="rgba(255,255,255,0.45)" transform="rotate(-25,-7,-11)"/>
    </g>
    <g transform="translate(462, 272)">
      <ellipse cx="0" cy="0" rx="21" ry="25" fill="#FFAB40"/>
      <polygon points="-4,25 4,25 0,33" fill="#FF6D00"/>
      <path d="M 0,33 Q -6,50 4,66 Q -4,82 0,98" fill="none" stroke="#FF6D00" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="-6" cy="-9" rx="6" ry="4" fill="rgba(255,255,255,0.45)" transform="rotate(-25,-6,-9)"/>
    </g>
    <!-- FLOWER -->
    <g transform="translate(82, 492)">
      <line x1="0" y1="0" x2="0" y2="38" stroke="#66BB6A" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="-12" cy="22" rx="12" ry="6" fill="#81C784" transform="rotate(-35,-12,22)"/>
      <ellipse cx="12" cy="28" rx="12" ry="6" fill="#81C784" transform="rotate(35,12,28)"/>
      ${petals}
      <circle cx="0" cy="-14" r="13" fill="#FFD740"/>
      <circle cx="0" cy="-14" r="5.5" fill="#FF8F00"/>
    </g>
    <!-- RUBBER DUCK -->
    <g transform="translate(260, 472)">
      <ellipse cx="0" cy="14" rx="34" ry="26" fill="#FFD740"/>
      <circle cx="26" cy="-10" r="21" fill="#FFD740"/>
      <polygon points="43,-12 58,-7 43,-2" fill="#FF8F00"/>
      <circle cx="32" cy="-16" r="5.5" fill="#37474F"/>
      <circle cx="33" cy="-17" r="2" fill="#FFFFFF"/>
      <ellipse cx="-4" cy="8" rx="16" ry="10" fill="#FFC107" transform="rotate(-12,-4,8)"/>
      <path d="M 16,-28 Q 20,-40 25,-28 Q 29,-42 33,-28" fill="none" stroke="#FF8F00" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <!-- BUILDING BLOCK -->
    <g transform="translate(452, 456)">
      <rect x="0" y="22" width="58" height="58" rx="7" fill="#42A5F5"/>
      <polygon points="0,22 16,6 74,6 58,22" fill="#64B5F6"/>
      <polygon points="58,22 74,6 74,64 58,80" fill="#1E88E5"/>
      <text x="29" y="63" font-size="30" font-weight="bold" fill="#FFFFFF" font-family="Arial, sans-serif" text-anchor="middle">A</text>
    </g>
    <!-- HEARTS -->
    <g transform="translate(188, 52)"><path d="M 0,-9 C -12,-20 -24,0 0,16 C 24,0 12,-20 0,-9 Z" fill="#FF8A80"/></g>
    <g transform="translate(152, 198)" opacity="0.85"><path d="M 0,-7 C -10,-16 -19,0 0,13 C 19,0 10,-16 0,-7 Z" fill="#F48FB1"/></g>
    <g transform="translate(356, 178)"><path d="M 0,-7 C -10,-16 -19,0 0,13 C 19,0 10,-16 0,-7 Z" fill="#FF80AB"/></g>
    <g transform="translate(48, 302)" opacity="0.8"><path d="M 0,-6 C -8,-13 -16,0 0,11 C 16,0 8,-13 0,-6 Z" fill="#FF8A80"/></g>
    <g transform="translate(200, 410)"><path d="M 0,-6 C -8,-13 -16,0 0,11 C 16,0 8,-13 0,-6 Z" fill="#F48FB1"/></g>
    <!-- STARS -->
    <g transform="translate(192, 162)"><polygon points="0,-13 3.5,-5 12,-5 5.5,1 8,10.5 0,5 -8,10.5 -5.5,1 -12,-5 -3.5,-5" fill="#FFD740"/></g>
    <g transform="translate(405, 132)" opacity="0.9"><polygon points="0,-11 3,-4 10,-4 4.5,0.5 7,9 0,4.5 -7,9 -4.5,0.5 -10,-4 -3,-4" fill="#FFEE58"/></g>
    <g transform="translate(52, 158)"><polygon points="0,-10 2.5,-3.5 9.5,-3.5 4,0.5 6.5,8.5 0,4 -6.5,8.5 -4,0.5 -9.5,-3.5 -2.5,-3.5" fill="#FFD740"/></g>
    <g transform="translate(383, 52)"><polygon points="0,-11 3,-4 10,-4 4.5,0.5 7,9 0,4.5 -7,9 -4.5,0.5 -10,-4 -3,-4" fill="#FFEE58"/></g>
    <g transform="translate(490, 200)" opacity="0.8"><polygon points="0,-9 2,-3 8,-3 3.5,0.5 5.5,7.5 0,3.5 -5.5,7.5 -3.5,0.5 -8,-3 -2,-3" fill="#FFD740"/></g>
    <!-- PAINT BLOBS -->
    <circle cx="340" cy="350" r="9" fill="#FF80AB"/>
    <circle cx="356" cy="362" r="6" fill="#80DEEA"/>
    <circle cx="326" cy="364" r="7" fill="#A5D6A7"/>
    <circle cx="345" cy="374" r="5" fill="#FFD740"/>
  `
}

// ── Teens pattern ──────────────────────────────────────────────────────────

function teensPatternContent(): string {
  // Calculator buttons 4×4
  const calcButtons = [0, 1, 2, 3].flatMap(row =>
    [0, 1, 2, 3].map(col =>
      `<rect x="${7 + col * 15}" y="${36 + row * 15}" width="11" height="11" rx="2.5" fill="${row === 0 ? '#4C6EF5' : col === 3 ? '#c62828' : '#37474F'}"/>`
    )
  ).join('')

  // Smartphone app icons 4×3
  const appIcons = [0, 1, 2, 3].flatMap(row =>
    [0, 1, 2].map(col =>
      `<rect x="${9 + col * 14}" y="${22 + row * 14}" width="10" height="10" rx="2.5" fill="rgba(255,255,255,0.3)"/>`
    )
  ).join('')

  return `
    <!-- GRADUATION CAP -->
    <g transform="translate(76, 82)">
      <polygon points="0,-42 58,-20 0,4 -58,-20" fill="#1A1B2E"/>
      <polygon points="0,-42 58,-20 0,4 -58,-20" fill="none" stroke="#4C6EF5" stroke-width="1.5"/>
      <rect x="-20" y="4" width="40" height="14" rx="2" fill="#263238"/>
      <ellipse cx="0" cy="18" rx="20" ry="5" fill="#1A1B2E"/>
      <circle cx="58" cy="-20" r="7" fill="#FCC419"/>
      <line x1="58" y1="-13" x2="58" y2="15" stroke="#FCC419" stroke-width="3" stroke-linecap="round"/>
      <line x1="58" y1="15" x2="43" y2="15" stroke="#FCC419" stroke-width="3" stroke-linecap="round"/>
      <line x1="37" y1="15" x2="33" y2="30" stroke="#FCC419" stroke-width="2" stroke-linecap="round"/>
      <line x1="39" y1="15" x2="37" y2="32" stroke="#FCC419" stroke-width="2" stroke-linecap="round"/>
      <line x1="41" y1="15" x2="41" y2="33" stroke="#FCC419" stroke-width="2" stroke-linecap="round"/>
      <line x1="43" y1="15" x2="45" y2="32" stroke="#FCC419" stroke-width="2" stroke-linecap="round"/>
      <line x1="45" y1="15" x2="49" y2="30" stroke="#FCC419" stroke-width="2" stroke-linecap="round"/>
    </g>
    <!-- LAPTOP -->
    <g transform="translate(378, 46)">
      <rect x="4" y="0" width="96" height="70" rx="6" fill="#1A1B2E"/>
      <rect x="9" y="5" width="86" height="60" rx="3" fill="#4C6EF5"/>
      <rect x="16" y="14" width="46" height="4" rx="2" fill="rgba(255,255,255,0.85)"/>
      <rect x="21" y="22" width="62" height="3.5" rx="2" fill="rgba(255,255,255,0.5)"/>
      <rect x="21" y="29" width="38" height="3.5" rx="2" fill="rgba(255,255,255,0.75)"/>
      <rect x="21" y="36" width="54" height="3.5" rx="2" fill="rgba(255,255,255,0.5)"/>
      <rect x="21" y="43" width="28" height="3.5" rx="2" fill="rgba(255,255,255,0.85)"/>
      <rect x="21" y="50" width="48" height="3.5" rx="2" fill="rgba(255,255,255,0.4)"/>
      <circle cx="52" cy="3" r="2.5" fill="rgba(255,255,255,0.4)"/>
      <rect x="0" y="70" width="104" height="13" rx="5" fill="#263238"/>
      <rect x="32" y="76" width="40" height="5" rx="3" fill="#37474F"/>
    </g>
    <!-- MATH FORMULAS -->
    <text x="210" y="87" font-size="21" font-weight="bold" font-style="italic" fill="#1A1B2E" font-family="Georgia, serif">E = mc²</text>
    <text x="35" y="198" font-size="16" font-weight="bold" font-style="italic" fill="#1A1B2E" font-family="Georgia, serif">a² + b² = c²</text>
    <text x="508" y="158" font-size="30" fill="#4C6EF5" font-family="Georgia, serif">∞</text>
    <text x="242" y="318" font-size="19" font-style="italic" fill="#1A1B2E" font-family="Georgia, serif">∫ f(x)dx</text>
    <text x="142" y="370" font-size="17" font-weight="bold" font-style="italic" fill="#1A1B2E" font-family="Georgia, serif">F = ma</text>
    <text x="488" y="385" font-size="28" fill="#12B886" font-family="Georgia, serif">π</text>
    <text x="362" y="415" font-size="16" fill="#1A1B2E" font-family="Georgia, serif">Σ xᵢ / n</text>
    <!-- DIPLOMA -->
    <g transform="translate(32, 272)">
      <rect x="14" y="0" width="88" height="65" fill="#FFF8E1"/>
      <ellipse cx="14" cy="32" rx="12" ry="32" fill="#FFE082"/>
      <ellipse cx="14" cy="32" rx="6" ry="32" fill="#FFD740"/>
      <ellipse cx="102" cy="32" rx="12" ry="32" fill="#FFE082"/>
      <ellipse cx="102" cy="32" rx="6" ry="32" fill="#FFD740"/>
      <line x1="24" y1="12" x2="92" y2="12" stroke="#8D6E63" stroke-width="3"/>
      <line x1="24" y1="24" x2="92" y2="24" stroke="#BDBDBD" stroke-width="2"/>
      <line x1="24" y1="33" x2="92" y2="33" stroke="#BDBDBD" stroke-width="2"/>
      <line x1="24" y1="42" x2="74" y2="42" stroke="#BDBDBD" stroke-width="2"/>
      <circle cx="58" cy="55" r="11" fill="#B71C1C"/>
      <polygon points="58,45 60.5,51 67,51 62,55.5 64,62 58,58 52,62 54,55.5 49,51 55.5,51" fill="#FFD740"/>
    </g>
    <!-- COMPASS -->
    <g transform="translate(210, 188)">
      <line x1="0" y1="0" x2="-20" y2="58" stroke="#455A64" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="0" y1="0" x2="20" y2="58" stroke="#455A64" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="0" cy="0" r="8" fill="#FCC419"/>
      <circle cx="0" cy="0" r="4" fill="#E6A800"/>
      <line x1="-20" y1="58" x2="-22" y2="68" stroke="#9E9E9E" stroke-width="3" stroke-linecap="round"/>
      <rect x="17" y="57" width="6" height="14" rx="1" fill="#7986CB"/>
      <polygon points="17,71 23,71 20,79" fill="#1A1B2E"/>
      <path d="M-22,68 A72,72 0 0,1 20,72" fill="none" stroke="#4C6EF5" stroke-width="1.8" stroke-dasharray="5,4"/>
    </g>
    <!-- CALCULATOR -->
    <g transform="translate(392, 200)">
      <rect x="0" y="0" width="70" height="98" rx="9" fill="#1A1B2E"/>
      <rect x="6" y="8" width="58" height="22" rx="4" fill="#B2DFDB"/>
      <text x="58" y="25" font-size="12" fill="#004D40" text-anchor="end" font-family="monospace" font-weight="bold">3.14159</text>
      ${calcButtons}
    </g>
    <!-- SMARTPHONE -->
    <g transform="translate(464, 292)">
      <rect x="0" y="0" width="52" height="95" rx="11" fill="#212121"/>
      <rect x="3" y="5" width="46" height="80" rx="9" fill="#4C6EF5"/>
      <rect x="16" y="7" width="20" height="5" rx="2.5" fill="#212121"/>
      ${appIcons}
      <rect x="17" y="88" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.5)"/>
    </g>
    <!-- BASKETBALL -->
    <g transform="translate(82, 434)">
      <circle cx="0" cy="0" r="38" fill="#EF6C00" stroke="#4E342E" stroke-width="2.5"/>
      <path d="M-38,0 Q-20,-34 0,-38 Q20,-34 38,0" fill="none" stroke="#4E342E" stroke-width="2.5"/>
      <path d="M-38,0 Q-20,34 0,38 Q20,34 38,0" fill="none" stroke="#4E342E" stroke-width="2.5"/>
      <line x1="0" y1="-38" x2="0" y2="38" stroke="#4E342E" stroke-width="2.5"/>
      <path d="M-26,-28 Q0,-40 26,-28" fill="none" stroke="#4E342E" stroke-width="2"/>
      <path d="M-26,28 Q0,40 26,28" fill="none" stroke="#4E342E" stroke-width="2"/>
    </g>
    <!-- HEADPHONES -->
    <g transform="translate(274, 440)">
      <path d="M-44,0 Q-46,-70 0,-73 Q46,-70 44,0" fill="none" stroke="#37474F" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="0" cy="-71" rx="13" ry="6" fill="#455A64"/>
      <ellipse cx="-44" cy="0" rx="20" ry="24" fill="#4C6EF5"/>
      <ellipse cx="-44" cy="0" rx="11" ry="14" fill="#3B5BDB"/>
      <ellipse cx="44" cy="0" rx="20" ry="24" fill="#4C6EF5"/>
      <ellipse cx="44" cy="0" rx="11" ry="14" fill="#3B5BDB"/>
      <path d="M-44,24 Q-44,42 -32,48" fill="none" stroke="#37474F" stroke-width="3" stroke-linecap="round"/>
      <circle cx="-30" cy="50" r="5" fill="#FCC419"/>
    </g>
    <!-- LIGHTNING BOLTS -->
    <g transform="translate(178, 450)"><polygon points="10,0 3,18 9,18 2,36 20,14 14,14 21,0" fill="#FCC419"/></g>
    <g transform="translate(418, 460)"><polygon points="9,0 3,16 8,16 1,32 18,12 12,12 18,0" fill="#FCC419"/></g>
    <g transform="translate(352, 88)" opacity="0.75"><polygon points="7,0 2,12 6,12 1,24 14,9 9,9 14,0" fill="#FCC419"/></g>
    <!-- STARS -->
    <g transform="translate(192, 152)"><polygon points="0,-13 3.5,-5 12,-5 5.5,1 8,10 0,4.5 -8,10 -5.5,1 -12,-5 -3.5,-5" fill="#FCC419"/></g>
    <g transform="translate(48, 150)"><polygon points="0,-11 3,-4 10,-4 4.5,0.5 7,9 0,4 -7,9 -4.5,0.5 -10,-4 -3,-4" fill="#FCC419"/></g>
    <g transform="translate(492, 50)"><polygon points="0,-12 3.5,-4.5 11,-4.5 5,0.5 8,10 0,4.5 -8,10 -5,0.5 -11,-4.5 -3.5,-4.5" fill="#FCC419"/></g>
    <g transform="translate(50, 378)" opacity="0.8"><polygon points="0,-10 2.5,-3.5 9,-3.5 4,0.5 6,8 0,3.5 -6,8 -4,0.5 -9,-3.5 -2.5,-3.5" fill="#4C6EF5"/></g>
    <g transform="translate(342, 256)"><polygon points="0,-9 2,-3 8,-3 3.5,0.5 5.5,7.5 0,3.5 -5.5,7.5 -3.5,0.5 -8,-3 -2,-3" fill="#12B886"/></g>
    <g transform="translate(160, 255)" opacity="0.7"><polygon points="0,-8 2,-2.5 7.5,-2.5 3,0.5 5,7 0,3 -5,7 -3,0.5 -7.5,-2.5 -2,-2.5" fill="#FCC419"/></g>
  `
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Returns a full A4-sized SVG string (595×842) with the tiling background pattern.
 * Returns null for 'none'.
 */
export function getBgPatternSvg(patternId: string | null | undefined): string | null {
  if (!patternId || patternId === 'none') return null

  const TILE = 560
  let content: string

  if (patternId === 'school') content = schoolPatternContent()
  else if (patternId === 'kindergarten') content = kinderPatternContent()
  else if (patternId === 'teens') content = teensPatternContent()
  else return null

  // opacity baked into the SVG so the PNG is semi-transparent and works
  // as a watermark regardless of stacking order in react-pdf
  return `<svg xmlns="http://www.w3.org/2000/svg" width="595" height="842" opacity="0.1">
    <defs>
      <pattern id="bg" x="0" y="0" width="${TILE}" height="${TILE}" patternUnits="userSpaceOnUse">
        ${content}
      </pattern>
    </defs>
    <rect width="595" height="842" fill="url(#bg)"/>
  </svg>`
}
