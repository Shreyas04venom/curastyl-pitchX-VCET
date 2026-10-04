import os
import shutil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_student_founder_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Palettes: Premium Cyber-Luxe Dark Palette
    BG_DARK = RGBColor(10, 12, 22)         # Deepest Navy #0A0C16
    CARD_BG = RGBColor(18, 22, 38)         # Surface Card #121626
    CARD_BORDER = RGBColor(40, 52, 84)     # Subtle Slate Border
    CARD_BG_ALT = RGBColor(25, 31, 52)     # Highlight Card
    PURPLE_ACCENT = RGBColor(168, 85, 247) # Electric Purple #A855F7
    PINK_ACCENT = RGBColor(236, 72, 153)   # Vibrant Pink #EC4899
    CYAN_ACCENT = RGBColor(6, 182, 212)    # Neon Cyan #06B6D4
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(165, 175, 195)   # Light readable gray
    TEXT_GOLD = RGBColor(251, 191, 36)     # Accent Gold #FBBF24
    GREEN_ACCENT = RGBColor(34, 197, 94)   # Success Green #22C55E
    RED_ACCENT = RGBColor(239, 68, 68)     # Warning Red #EF4444

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, category, title, subtitle):
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.3))
        tf = cat_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = category.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = PURPLE_ACCENT

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.55))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.25), Inches(11.7), Inches(0.4))
        tf = sub_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = subtitle
        p.font.size = Pt(12)
        p.font.color.rgb = TEXT_MUTED

    def create_card(slide, left, top, width, height, title, body_bullets, border_color=CARD_BORDER, bg_color=CARD_BG, title_color=CYAN_ACCENT):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.2)
        
        tb = slide.shapes.add_textbox(Inches(left + 0.15), Inches(top + 0.15), Inches(width - 0.3), Inches(height - 0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        if title:
            p0 = tf.paragraphs[0]
            p0.text = title
            p0.font.size = Pt(12.5)
            p0.font.bold = True
            p0.font.color.rgb = title_color
            p0.space_after = Pt(5)
        
        for idx, bullet in enumerate(body_bullets):
            p = tf.add_paragraph() if (title or idx > 0) else tf.paragraphs[0]
            if bullet.strip():
                p.text = ('• ' if not bullet.startswith('  ') else '    - ') + bullet.strip()
                p.font.size = Pt(10)
                p.font.color.rgb = TEXT_WHITE if not bullet.startswith('  ') else TEXT_MUTED
                p.space_after = Pt(3.5)
            else:
                p.text = ''
                p.space_after = Pt(2)
        return card

    # =========================================================================
    # SLIDE 1: Title & Executive Overview (AgniDev's + Team Names)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)
    
    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.7), Inches(5.2), Inches(0.42))
    badge.fill.solid()
    badge.fill.fore_color.rgb = CARD_BG
    badge.line.color.rgb = PURPLE_ACCENT
    tf = badge.text_frame
    p = tf.paragraphs[0]
    p.text = '🏆 PITCHX 2026 | JIO WORLD CENTRE, BKC MUMBAI'
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = TEXT_GOLD

    tb = s1.shapes.add_textbox(Inches(0.8), Inches(1.2), Inches(7.5), Inches(1.1))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = 'CuraStyl ✨'
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    tb = s1.shapes.add_textbox(Inches(0.8), Inches(2.35), Inches(7.5), Inches(1.0))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = 'India’s 1st AI-Enabled Hyperlocal Salon Marketplace & 3D WebAR Virtual Try-On Super-App'
    p.font.size = Pt(17)
    p.font.bold = True
    p.font.color.rgb = CYAN_ACCENT

    tb = s1.shapes.add_textbox(Inches(0.8), Inches(3.45), Inches(7.3), Inches(1.1))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = 'Solving post-haircut regret and salon idle capacity for Men & Women using real-time browser 3D camera try-on, Gemini 1.5 multimodal AI consultation, instant slot booking, and salon SaaS.'
    p.font.size = Pt(11.5)
    p.font.color.rgb = TEXT_MUTED

    team_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.7), Inches(7.2), Inches(2.2))
    team_card.fill.solid()
    team_card.fill.fore_color.rgb = CARD_BG
    team_card.line.color.rgb = CARD_BORDER
    tf = team_card.text_frame
    tf.word_wrap = True
    
    p = tf.paragraphs[0]
    p.text = 'Presented by Team AgniDev’s (FRCRCE):'
    p.font.size = Pt(11.5)
    p.font.bold = True
    p.font.color.rgb = PURPLE_ACCENT
    
    p = tf.add_paragraph()
    p.text = '👨‍💻 Shreyas Mahajan (Tech Lead & WebAR 3D)  |  🧠 Arnav Brahmane (AI & Gemini Architect)  |  📈 Akshat Churi (Product & Growth)'
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_WHITE
    p.space_after = Pt(6)
    
    p = tf.add_paragraph()
    p.text = '🌐 Live Deployed Platform: https://curastyl.agnidev.me  (100% Functional MVP Ready for Demo)'
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = GREEN_ACCENT

    landing_img = 'screenshots/landing_page_1787301411961.png'
    if os.path.exists(landing_img):
        s1.shapes.add_picture(landing_img, Inches(8.3), Inches(1.0), Inches(4.3), Inches(5.8))

    # =========================================================================
    # SLIDE 2: Problem Statement
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_header(s2, 'THE PROBLEM', 'The Three Major Breakdowns in India’s Salon & Grooming Industry', 'Customers face blind styling anxiety, while neighborhood salons suffer from idle chairs and zero digital tools.')

    p_cards = [
        ('1. Post-Haircut Regret (82% Anxiety)', [
            '82% of young Indians experience anxiety before visiting a salon.',
            'No tool exists to pre-visualize hairstyles on their actual 3D face structure & skin tone.',
            'Customer references (Pinterest/Celebrities) fail in execution, causing disappointment.'
        ], RED_ACCENT),
        ('2. 42% Salon Idle Capacity & No-Shows', [
            'Local salons run at only 58% average chair occupancy on weekdays.',
            '18% to 25% appointment no-shows because bookings are unconfirmed over phone.',
            'High-skill neighborhood barbers have zero digital reach and struggle to compete with luxury chains.'
        ], RED_ACCENT),
        ('3. Disjointed & Inefficient Booking', [
            'Listing platforms (Google Maps/JustDial) only provide static phone numbers with zero live scheduling.',
            'Salon owners manage operations on paper diaries and WhatsApp messages.',
            'No unified loyalty rewards or personalized AI consultation for customers.'
        ], RED_ACCENT)
    ]
    for i, (title, bullets, col) in enumerate(p_cards):
        create_card(s2, 0.8 + i*3.95, 1.8, 3.8, 5.1, title, bullets, border_color=CARD_BORDER, bg_color=CARD_BG, title_color=col)

    # =========================================================================
    # SLIDE 3: The Solution
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3)
    add_header(s3, 'THE SOLUTION', 'CuraStyl’s Triple-Engine Beauty-Tech Ecosystem', 'A synchronized double-sided platform connecting smart visual discovery with instant booking & salon SaaS.')

    s_cards = [
        ('✨ Engine 1: AuraAI Consultation', [
            'Powered by Google Gemini 1.5 with 10-key automatic rotation.',
            'Analyzes facial structure, skin tone, hair texture, and style vibe.',
            'Fetches live visual inspiration carousels via Pexels & Google CSE.',
            'Contextual deep-linking directly into Try-On & appointment booking.'
        ], PURPLE_ACCENT),
        ('👓 Engine 2: 3D WebAR Virtual Try-On', [
            'Real-time webcam face mapping via MediaPipe 468 3D landmarks.',
            'Three.js & React Three Fiber dynamic 3D hairstyle projection (.glb).',
            'Zero app installation required—runs smoothly inside any mobile browser.',
            'Separate, highly curated catalogs for Men & Women.'
        ], CYAN_ACCENT),
        ('🏪 Engine 3: Hyperlocal Booking & SaaS', [
            'Geolocation discovery covering Bandra, BKC, Andheri, Powai, Juhu.',
            'Real-time slot reservation preventing double-bookings with QR check-in.',
            'GlamPoints gamified loyalty economy (earn on visit, burn at checkout).',
            'Salon Owner ERP: live scheduler, staff assignment, revenue & reviews.'
        ], PINK_ACCENT)
    ]
    for i, (title, bullets, col) in enumerate(s_cards):
        create_card(s3, 0.8 + i*3.95, 1.8, 3.8, 5.1, title, bullets, border_color=col, bg_color=CARD_BG_ALT, title_color=col)

    # =========================================================================
    # SLIDE 4: Architecture & Innovation
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_header(s4, 'TECHNICAL ARCHITECTURE', 'Enterprise-Grade Full-Stack & Browser AI/AR Stack', 'Lightweight client-side processing, high security, and high reliability built by student engineers.')

    tech_cols = [
        ('Client & WebAR 3D Engine', [
            'Next.js 15 & React 19 for server rendering & instantaneous transitions.',
            'MediaPipe FaceMesh: 468 3D landmarks at 60 FPS in browser.',
            'Three.js / React Three Fiber: Dynamic mesh scaling, lighting & .glb models.',
            'Tailwind CSS & Framer Motion for responsive glassmorphism UI.'
        ], CYAN_ACCENT),
        ('Multimodal AI Core', [
            'Google Gemini 1.5 Pro & Flash multimodal intelligence.',
            '10-Key Auto-Rotation failover system ensuring 99.99% uptime.',
            'Style DNA Profiling with facial mood & feature extraction.',
            'Visual Search Integration with Pexels API & Google CSE.'
        ], PURPLE_ACCENT),
        ('Backend, Database & Security', [
            'Supabase PostgreSQL with strict Row-Level Security (RLS).',
            'Role-Based Middleware protecting customer vs salon-owner paths.',
            'Unified Payments: Direct UPI simulator & Razorpay integration.',
            'QR Verification Engine & Automated booking reminder cron jobs.'
        ], GREEN_ACCENT)
    ]
    for i, (title, bullets, col) in enumerate(tech_cols):
        create_card(s4, 0.8 + i*3.95, 1.8, 3.8, 5.1, title, bullets, border_color=CARD_BORDER, bg_color=CARD_BG, title_color=col)

    # =========================================================================
    # SLIDE 5: Live App Screenshots
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    add_header(s5, 'PRODUCT DEMO & SCREENSHOTS', '100% Built & Live Production Features (Men & Women)', 'Live platform accessible on mobile & desktop: https://curastyl.agnidev.me')

    imgs = [
        ('screenshots/salons_page_1787301443031.png', '1. Hyperlocal Discovery & Filters', Inches(0.8), Inches(1.8), Inches(3.7), Inches(2.4)),
        ('screenshots/ai_assistant_page_1787301995464.png', '2. AuraAI Chat & Visual Carousels', Inches(4.8), Inches(1.8), Inches(3.7), Inches(2.4)),
        ('screenshots/virtual_tryon_women_page_1787302104921.png', '3. Real-Time 3D WebAR Mirror', Inches(8.8), Inches(1.8), Inches(3.7), Inches(2.4)),
        ('screenshots/offers_page_1787302150212.png', '4. Offers, Deals & Promotions', Inches(0.8), Inches(4.5), Inches(3.7), Inches(2.4)),
        ('screenshots/upgrade_page_1787302199760.png', '5. Salon SaaS & Customer Plans', Inches(4.8), Inches(4.5), Inches(3.7), Inches(2.4)),
        ('screenshots/virtual_tryon_intro_page_1787302041432.png', '6. Gender Selection Hub (Men/Women)', Inches(8.8), Inches(4.5), Inches(3.7), Inches(2.4))
    ]
    for path, label, l, t, w, h in imgs:
        if os.path.exists(path):
            s5.shapes.add_picture(path, l, t, w, h)
            lbl = s5.shapes.add_textbox(l, t + h - Inches(0.35), w, Inches(0.35))
            tf = lbl.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.text = label
            p.font.size = Pt(9.5)
            p.font.bold = True
            p.font.color.rgb = TEXT_WHITE
            lbl.fill.solid()
            lbl.fill.fore_color.rgb = BG_DARK

    # =========================================================================
    # SLIDE 6: Dual Audience (Men & Women)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    add_header(s6, 'TARGET AUDIENCE', 'Serving Both Men & Women with Tailored User Journeys', 'Unlocking India’s fast-growing male grooming market and high-ticket women’s beauty services.')

    create_card(s6, 0.8, 1.8, 5.7, 5.1, '👨 Men’s Grooming Journey (Booming 22% CAGR)', [
        'High Visit Frequency: Men visit salons every 2-3 weeks (18-24 visits per year).',
        'Expanding Basket Size: Beard styling, fades, scalp care, detan & men’s facials.',
        'Virtual Try-On: 21+ real-time 3D male hairstyles & beard styles via browser webcam.',
        'Frictionless UPI Booking: Instant 30-second slot lock with zero waiting time.',
        'AuraAI Barber Consultation: Recommends cuts based on jawline, face shape & workplace style.'
    ], border_color=CYAN_ACCENT, bg_color=CARD_BG, title_color=CYAN_ACCENT)

    create_card(s6, 6.8, 1.8, 5.7, 5.1, '👩 Women’s Beauty & Styling (High-AOV Luxury)', [
        'High Average Order Value: Hair spas, balayage, smoothening, bridal styling (₹1,500 - ₹8,000 AOV).',
        'Visual Criticality: 16+ curated female 3D hair models (.glb) eliminate post-cut regret.',
        'AuraAI Style DNA: Skin tone & mood analysis suggesting complementary color tones & highlights.',
        'Verified Reviews & Portfolios: Real stylist ratings, photo showcases & hygiene verification.',
        'GlamPoints Rewards: Earn significant reward points on high-value treatments for future discounts.'
    ], border_color=PINK_ACCENT, bg_color=CARD_BG, title_color=PINK_ACCENT)

    # =========================================================================
    # SLIDE 7: Market Opportunity (TAM - SAM - SOM)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_bg(s7)
    add_header(s7, 'MARKET OPPORTUNITY', 'Tapping India’s ₹1.65 Lakh Cr ($20B) Beauty & Wellness Boom', 'Massive unorganized market rapidly digitizing with 18.2% annual growth in salon bookings.')

    tam_cards = [
        ('₹1,65,000 Cr ($20B)', 'TAM: Total Addressable Market', 'Overall Indian Beauty, Grooming & Personal Care Market by 2028 (18.2% CAGR)', PURPLE_ACCENT),
        ('₹65,000 Cr ($7.8B)', 'SAM: Serviceable Addressable Market', 'Organized and Semi-Organized Salon & Parlor Services across Urban India', CYAN_ACCENT),
        ('₹3,250 Cr ($390M)', 'SOM: Serviceable Obtainable Market', 'Target 5% market share in Top 8 Metros (Mumbai, Delhi-NCR, Bengaluru, etc.) within 4 years', GREEN_ACCENT)
    ]
    for i, (metric, title, desc, col) in enumerate(tam_cards):
        card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8 + i*1.7), Inches(5.6), Inches(1.5))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = CARD_BORDER
        tf = card.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = metric
        p1.font.size = Pt(17)
        p1.font.bold = True
        p1.font.color.rgb = col
        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_WHITE
        p3 = tf.add_paragraph()
        p3.text = desc
        p3.font.size = Pt(9.5)
        p3.font.color.rgb = TEXT_MUTED

    create_card(s7, 6.8, 1.8, 5.7, 5.1, 'Key Growth Drivers in India', [
        'Gen Z & Millennial Grooming Surge: 65% of salon spend driven by 18–35 age cohort seeking trendy styles.',
        'Male Grooming Explosion: Men’s grooming in India growing at 22%+ CAGR, demanding specialized beard and hair styling.',
        'Shift from Walk-Ins to Instant Booking: 74% of smartphone users prefer online slot locking over waiting in lines.',
        'SaaS Adoption by Local Salons: Salon owners eager for tools to reduce no-shows and increase weekday table turnover.',
        'AI/AR Personalization as Conversion Driver: 3D Try-On increases service booking conversion by +38%.'
    ], border_color=PURPLE_ACCENT, bg_color=CARD_BG_ALT, title_color=PURPLE_ACCENT)

    # =========================================================================
    # SLIDE 8: Competitive Advantage & Moat Matrix
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_bg(s8)
    add_header(s8, 'COMPETITIVE LANDSCAPE', 'Why CuraStyl Dominates Generic Competitors', 'Competitors only offer home visits or static phone directories; CuraStyl owns the visual-to-chair workflow.')

    rows, cols = 6, 6
    left, top, width, height = Inches(0.8), Inches(1.8), Inches(11.7), Inches(5.1)
    table_shape = s8.shapes.add_table(rows, cols, left, top, width, height)
    table = table_shape.table
    table.columns[0].width = Inches(2.7)
    for c in range(1, 6):
        table.columns[c].width = Inches(1.8)

    headers = ['Feature / Capability', 'CuraStyl ✨', 'Urban Company', 'Fresha', 'Nykaa / Purplle', 'JustDial / G-Maps']
    for c, h in enumerate(headers):
        cell = table.cell(0, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = CARD_BG_ALT if c != 1 else PURPLE_ACCENT
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(10.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.alignment = PP_ALIGN.CENTER

    data = [
        ['Real-Time 3D WebAR Try-On', '✅ Live 3D FaceMesh', '❌ None', '❌ None', '⚠️ 2D Makeup only', '❌ None'],
        ['Gemini Multimodal AI Stylist', '✅ AuraAI (Voice/Img)', '❌ Basic FAQ bot', '❌ None', '❌ Basic search', '❌ None'],
        ['Hyperlocal Physical Salon Booking', '✅ Real-time Slot Lock', '❌ At-home only', '⚠️ Limited in India', '❌ E-commerce focus', '❌ Unverified phone'],
        ['Salon B2B ERP & Live Calendar', '✅ Built-in SaaS', '❌ Closed gig model', '⚠️ Expensive SaaS', '❌ None', '❌ None'],
        ['Loyalty Economy (GlamPoints)', '✅ Integrated Checkout', '⚠️ UC Plus pass', '❌ None', '⚠️ E-com points only', '❌ None']
    ]
    for r_idx, row in enumerate(data):
        for c_idx, val in enumerate(row):
            cell = table.cell(r_idx + 1, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG if c_idx != 1 else RGBColor(30, 20, 50)
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(9.5)
            p.font.color.rgb = TEXT_WHITE if c_idx != 1 else CYAN_ACCENT
            p.alignment = PP_ALIGN.LEFT if c_idx == 0 else PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 9: Business Model & Monetization
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_bg(s9)
    add_header(s9, 'BUSINESS MODEL', '5 High-Margin, Diversified Revenue Streams', 'Multiple synergistic monetization levers creating robust unit economics and high recurring revenue.')

    rev_streams = [
        ('1. Marketplace Commission (8% - 12%)', [
            'Charged per confirmed booking facilitated through CuraStyl.',
            'Zero commission on initial 20 bookings to drive frictionless onboarding.',
            'Predictable recurring take-rate scaling directly with platform GMV.'
        ], PURPLE_ACCENT),
        ('2. Salon B2B SaaS Subscriptions', [
            'Starter Tier: Free (up to 50 bookings/month).',
            'Pro Plan (₹999/mo): Live calendar, staff management & analytics.',
            'Enterprise Plan (₹2,499/mo): Multi-branch ERP, SMS reminders, CRM.'
        ], CYAN_ACCENT),
        ('3. Featured Listings & Sponsored Salons', [
            'Hyperlocal ad placement for top-of-search in Bandra, BKC, Andheri.',
            'Flash deals & seasonal banner promotions for beauty festivals.',
            'High-margin advertising engine (₹1,500 - ₹5,000 per salon/month).'
        ], PINK_ACCENT),
        ('4. AI Style DNA & Customer Pro Pass', [
            'Freemium AI consultations & virtual try-ons.',
            'Pro Customer Pass (₹199/mo): Unlimited HD AR exports, premium salon discounts, 2x GlamPoints booster.'
        ], GREEN_ACCENT),
        ('5. GlamPoints Loyalty Economy', [
            'Commission arbitrage on point redemption partnerships.',
            'Brand-sponsored vouchers and beauty sample product promotions.'
        ], TEXT_GOLD)
    ]
    for i in range(3):
        title, bullets, col = rev_streams[i]
        create_card(s9, 0.8 + i*3.95, 1.8, 3.8, 2.4, title, bullets, border_color=CARD_BORDER, bg_color=CARD_BG, title_color=col)
    for i in range(2):
        title, bullets, col = rev_streams[3 + i]
        create_card(s9, 0.8 + i*5.95, 4.4, 5.8, 2.5, title, bullets, border_color=CARD_BORDER, bg_color=CARD_BG, title_color=col)

    # =========================================================================
    # SLIDE 10: Financial Growth & Unit Economics
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_bg(s10)
    add_header(s10, 'FINANCIAL PROJECTIONS', 'Realistic Growth Forecast & Unit Economics (FY26–FY30)', 'Grounded student-founder roadmap: starting lean in Mumbai, scaling to ₹61.5 Cr revenue with 78% Gross Margin.')

    create_card(s10, 0.8, 1.8, 4.6, 5.1, 'Healthy Unit Economics (Per Customer)', [
        'Average Order Value (AOV): ₹850 (Blended Men & Women).',
        'Customer Acquisition Cost (CAC): ₹180 (Organic AR virality & campus loops).',
        'Average Visits per Year: 8.5 visits.',
        'Annual Customer GMV: ₹7,225.',
        'Platform Net Take Rate: 10% = ₹722.50 / year.',
        'Customer Lifetime Value (LTV, 3 Yrs): ₹2,167.',
        'LTV / CAC Ratio: 12.0x (Outstanding SaaS/Marketplace benchmark).',
        'CAC Payback Period: 2.8 months.',
        'Gross Margin: 78% (Cloud-native Next.js & Supabase architecture).'
    ], border_color=GREEN_ACCENT, bg_color=CARD_BG_ALT, title_color=GREEN_ACCENT)

    rows, cols = 6, 5
    left, top, width, height = Inches(5.7), Inches(1.8), Inches(6.8), Inches(5.1)
    table_shape = s10.shapes.add_table(rows, cols, left, top, width, height)
    table = table_shape.table
    table.columns[0].width = Inches(2.0)
    for c in range(1, 5):
        table.columns[c].width = Inches(1.2)

    headers = ['Metric / Year', 'FY26 (Y1)', 'FY27 (Y2)', 'FY28 (Y3)', 'FY30 (Y5)']
    for c, h in enumerate(headers):
        cell = table.cell(0, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = PURPLE_ACCENT
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.alignment = PP_ALIGN.CENTER

    fin_data = [
        ['Onboarded Salons', '350', '1,800', '6,500', '25,000'],
        ['Active Customers', '45,000', '280,000', '1,100,000', '4,800,000'],
        ['Total Bookings', '180,000', '1,400,000', '6,200,000', '32,000,000'],
        ['Gross Platform GMV', '₹15.3 Cr', '₹119.0 Cr', '₹527.0 Cr', '₹2,720 Cr'],
        ['Net Revenue (CuraStyl)', '₹1.53 Cr', '₹13.1 Cr', '₹61.5 Cr', '₹142.0 Cr']
    ]
    for r_idx, row in enumerate(fin_data):
        for c_idx, val in enumerate(row):
            cell = table.cell(r_idx + 1, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = CARD_BG if r_idx % 2 == 0 else CARD_BG_ALT
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(9.5)
            p.font.bold = (c_idx == 0 or r_idx == 4)
            p.font.color.rgb = TEXT_GOLD if r_idx == 4 else (CYAN_ACCENT if c_idx > 0 else TEXT_WHITE)
            p.alignment = PP_ALIGN.LEFT if c_idx == 0 else PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 11: Go-To-Market & City Expansion
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_bg(s11)
    add_header(s11, 'GO-TO-MARKET STRATEGY', '3-Phase High-Velocity Execution Roadmap', 'Hyperlocal cluster strategy ensuring dense salon supply, instant booking reliability, and viral organic growth.')

    gtm_cards = [
        ('Phase 1: Mumbai Beachhead (Months 1–6)', [
            'Target Hubs: BKC, Bandra West, Andheri, Powai, Juhu.',
            'Supply Onboarding: 200 premium & neighborhood unisex salons with 0% commission launch.',
            'Demand Engine: College campus ambassadors (FRCRCE, NMIMS, Mithibai) & localized Instagram AR filter challenges.',
            'Milestone: 30,000 completed bookings & ₹2.5 Cr GMV.'
        ], PURPLE_ACCENT),
        ('Phase 2: Tier 1 Metros (Months 7–18)', [
            'Expansion Hubs: Bengaluru (Koramangala, Indiranagar), Delhi-NCR (Gurgaon, South Delhi), Pune, Hyderabad.',
            'B2B SaaS Monetization: Roll out Pro & Enterprise tiers (₹999 - ₹2,499/mo).',
            'Influencer Partnerships: 50+ beauty creators showcasing AuraAI Before & After WebAR transformations.',
            'Milestone: 1,500 active salons & ₹40 Cr GMV.'
        ], CYAN_ACCENT),
        ('Phase 3: Pan-India Dominance (Months 19–36)', [
            'Expansion: Tier 2 cities (Chandigarh, Ahmedabad, Jaipur, Kochi, Indore).',
            'Product Expansion: AI Skin Analysis, Dynamic Peak Pricing, Salon Inventory E-commerce.',
            'Enterprise Salon Chains: Integration with national salon franchises.',
            'Milestone: 10,000+ salons, ₹250+ Cr GMV, clear #1 market leadership.'
        ], PINK_ACCENT)
    ]
    for i, (title, bullets, col) in enumerate(gtm_cards):
        create_card(s11, 0.8 + i*3.95, 1.8, 3.8, 5.1, title, bullets, border_color=CARD_BORDER, bg_color=CARD_BG, title_color=col)

    # =========================================================================
    # SLIDE 12: The Ask, Team AgniDevs & Vision
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_bg(s12)
    add_header(s12, 'THE ASK & VISION', 'Backing India’s Next Beauty-Tech Breakthrough', 'Seeking ₹25–50 Lakhs Seed Support / PitchX 2026 Champion Grant to scale Mumbai and launch in Bengaluru.')

    create_card(s12, 0.8, 1.8, 5.7, 5.1, 'Funding & Resource Deployment (18 Months)', [
        '40% — Salon Merchant Acquisition & On-Ground BD in Mumbai & Bengaluru.',
        '30% — AI & 3D Engineering: Expanded 3D hairstyle asset library & multi-angle try-on.',
        '20% — Hyperlocal Campus Marketing & Instagram AR Viral Challenges.',
        '10% — Cloud Infrastructure (Supabase, Vercel) & Operational Reserve.',
        'Target 18-Month Output: 1,000 onboarded salons, 350,000 bookings, and ₹25 Cr GMV.'
    ], border_color=TEXT_GOLD, bg_color=CARD_BG_ALT, title_color=TEXT_GOLD)

    create_card(s12, 6.8, 1.8, 5.7, 5.1, 'Team AgniDev’s (FRCRCE) — Built for Speed', [
        '👨‍💻 Shreyas Mahajan: Full-Stack & 3D WebAR Lead (Three.js, MediaPipe).',
        '🧠 Arnav Brahmane: AI Architect & Multimodal LLM Lead (Gemini 1.5).',
        '📈 Akshat Churi: Product Management, Growth & Business Ops Lead.',
        'Proven Execution: 100% functional live app deployed with zero external capital.',
        '',
        '🚀 Live Demo: https://curastyl.agnidev.me',
        '📧 Contact: founders@curastyl.agnidev.me | BKC, Mumbai',
        '🏆 PitchX 2026 Winner Contender'
    ], border_color=PURPLE_ACCENT, bg_color=CARD_BG_ALT, title_color=CYAN_ACCENT)

    prs.save('CuraStyl_PitchX_2026_Master_Deck.pptx')
    print('SUCCESS: Master Pitch Deck saved as CuraStyl_PitchX_2026_Master_Deck.pptx')

    if os.path.exists('1.pptx'):
        try:
            shutil.copy('1.pptx', '1_backup_original.pptx')
        except Exception as e:
            pass
    prs.save('1.pptx')
    print('SUCCESS: Updated 1.pptx with the master presentation deck.')

if __name__ == '__main__':
    build_student_founder_deck()
