## Design Context

### Users
Climbers of all levels looking to find the perfect climbing shoe based on their foot shape, volume, and preferences. They use the app to browse shoes, analyze their foot profile in the "Foot Lab", and manage their personal "Shoe Sanctuary" collection. The interface should evoke excitement, joy, and curiosity as they explore the 3D models and technical details.

### Brand Personality
Engaging, Slick, Modern.
The tone is interactive and highly visual, blending the technical aspects of climbing gear with a polished, consumer-facing digital experience.

### Aesthetic Direction
Technical/precise with fluidity/organic elements.
The UI leverages an orientation-based fluid responsive design system, avoiding rigid breakpoints for a seamless scaling experience. The visual language includes a bold orange accent (`hsl(17, 83%, 54%)`), distinct custom typography (`sora`, `basteleur`, `tanker`, `so-cloudy`), and engaging interactive states like 3D perspective hovers and slow-spinning gradients. It balances high-precision data display with organic, flowing interactions.

### Design Principles
1. **Fluidity Above All**: Utilize the custom orientation-based scaling system (`var(--scale)`) to ensure typography, spacing, and layouts smoothly adapt to any device without abrupt breakpoint snapping.
2. **Engaging & Interactive**: Capitalize on micro-interactions (e.g., perspective text on hovers, gradients) and 3D visuals (React Three Fiber) to spark joy and curiosity during exploration.
3. **Technical Elegance**: Present complex, precise data (shoe aggressiveness, stiffness, volume) cleanly and clearly, maintaining a slick and modern aesthetic that feels like a premium tool rather than a basic spreadsheet.
4. **Bold Contrast**: Leverage the dark/light mode foundations, ensuring the primary orange accent pops and draws attention to key interactions, while letting the 3D models and shoe imagery take center stage.
5. **Distinctive Typography**: Thoughtfully apply the custom font stack (`sora` for readability, `basteleur`/`tanker`/`so-cloudy` for distinct headers) to maintain the brand's unique personality.
