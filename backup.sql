--
-- PostgreSQL database dump
--

\restrict 1OjO2Qe97ijNWeqJYSaYZ5m7T1QrxJBO5vXm1fnxcfLepYBVP1ikGf16bcflwev

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    content text,
    excerpt text,
    category character varying(100),
    featured_image_url text,
    author character varying(255),
    published boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_posts_id_seq OWNER TO postgres;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: color_combinations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.color_combinations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    front_color character varying(7) NOT NULL,
    mesh_color character varying(7) NOT NULL,
    brim_color character varying(7) NOT NULL,
    rope_color character varying(7),
    display_order integer DEFAULT 0,
    active boolean DEFAULT true
);


ALTER TABLE public.color_combinations OWNER TO postgres;

--
-- Name: color_combinations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.color_combinations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.color_combinations_id_seq OWNER TO postgres;

--
-- Name: color_combinations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.color_combinations_id_seq OWNED BY public.color_combinations.id;


--
-- Name: color_presets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.color_presets (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    hex character varying(7) NOT NULL,
    display_order integer DEFAULT 0,
    active boolean DEFAULT true
);


ALTER TABLE public.color_presets OWNER TO postgres;

--
-- Name: color_presets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.color_presets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.color_presets_id_seq OWNER TO postgres;

--
-- Name: color_presets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.color_presets_id_seq OWNED BY public.color_presets.id;


--
-- Name: contact_inquiries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_inquiries (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    message text,
    event_type character varying(100),
    event_date date,
    quantity integer,
    budget character varying(100),
    whiteboard_image_url text,
    file_url text,
    status character varying(50) DEFAULT 'new'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT contact_inquiries_status_check CHECK (((status)::text = ANY ((ARRAY['new'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.contact_inquiries OWNER TO postgres;

--
-- Name: contact_inquiries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contact_inquiries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_inquiries_id_seq OWNER TO postgres;

--
-- Name: contact_inquiries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contact_inquiries_id_seq OWNED BY public.contact_inquiries.id;


--
-- Name: gallery_item_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gallery_item_images (
    id integer NOT NULL,
    gallery_item_id integer,
    image_url text NOT NULL,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.gallery_item_images OWNER TO postgres;

--
-- Name: gallery_item_images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gallery_item_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gallery_item_images_id_seq OWNER TO postgres;

--
-- Name: gallery_item_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gallery_item_images_id_seq OWNED BY public.gallery_item_images.id;


--
-- Name: gallery_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gallery_items (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(100) NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.gallery_items OWNER TO postgres;

--
-- Name: gallery_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gallery_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gallery_items_id_seq OWNER TO postgres;

--
-- Name: gallery_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gallery_items_id_seq OWNED BY public.gallery_items.id;


--
-- Name: hat_canvas_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hat_canvas_config (
    id integer NOT NULL,
    hat_type_id integer,
    width integer DEFAULT 400,
    height integer DEFAULT 300,
    front_design_x integer DEFAULT 100,
    front_design_y integer DEFAULT 60,
    front_design_width integer DEFAULT 200,
    front_design_height integer DEFAULT 120,
    back_design_x integer DEFAULT 100,
    back_design_y integer DEFAULT 80,
    back_design_width integer DEFAULT 200,
    back_design_height integer DEFAULT 100
);


ALTER TABLE public.hat_canvas_config OWNER TO postgres;

--
-- Name: hat_canvas_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hat_canvas_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hat_canvas_config_id_seq OWNER TO postgres;

--
-- Name: hat_canvas_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hat_canvas_config_id_seq OWNED BY public.hat_canvas_config.id;


--
-- Name: hat_parts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hat_parts (
    id integer NOT NULL,
    hat_type_id integer,
    part_id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    default_color character varying(7) DEFAULT '#ffffff'::character varying,
    display_order integer DEFAULT 0
);


ALTER TABLE public.hat_parts OWNER TO postgres;

--
-- Name: hat_parts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hat_parts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hat_parts_id_seq OWNER TO postgres;

--
-- Name: hat_parts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hat_parts_id_seq OWNED BY public.hat_parts.id;


--
-- Name: hat_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hat_types (
    id integer NOT NULL,
    slug character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    category character varying(50),
    preview_image_url text,
    front_image_url text,
    back_image_url text,
    display_order integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    front_marker_color character varying(7),
    mesh_marker_color character varying(7),
    brim_marker_color character varying(7),
    rope_marker_color character varying(7)
);


ALTER TABLE public.hat_types OWNER TO postgres;

--
-- Name: hat_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hat_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hat_types_id_seq OWNER TO postgres;

--
-- Name: hat_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hat_types_id_seq OWNED BY public.hat_types.id;


--
-- Name: images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.images (
    id integer NOT NULL,
    filename character varying(255) NOT NULL,
    url text NOT NULL,
    cloudinary_public_id character varying(255),
    alt_text character varying(255),
    category character varying(100),
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.images OWNER TO postgres;

--
-- Name: images_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.images_id_seq OWNER TO postgres;

--
-- Name: images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.images_id_seq OWNED BY public.images.id;


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.newsletter_subscribers (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    subscribed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    active boolean DEFAULT true
);


ALTER TABLE public.newsletter_subscribers OWNER TO postgres;

--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.newsletter_subscribers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.newsletter_subscribers_id_seq OWNER TO postgres;

--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.newsletter_subscribers_id_seq OWNED BY public.newsletter_subscribers.id;


--
-- Name: pricing_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pricing_config (
    id integer NOT NULL,
    config_key character varying(50) NOT NULL,
    config_value jsonb NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pricing_config OWNER TO postgres;

--
-- Name: pricing_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pricing_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pricing_config_id_seq OWNER TO postgres;

--
-- Name: pricing_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pricing_config_id_seq OWNED BY public.pricing_config.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255),
    role character varying(50) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: color_combinations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_combinations ALTER COLUMN id SET DEFAULT nextval('public.color_combinations_id_seq'::regclass);


--
-- Name: color_presets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_presets ALTER COLUMN id SET DEFAULT nextval('public.color_presets_id_seq'::regclass);


--
-- Name: contact_inquiries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_inquiries ALTER COLUMN id SET DEFAULT nextval('public.contact_inquiries_id_seq'::regclass);


--
-- Name: gallery_item_images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery_item_images ALTER COLUMN id SET DEFAULT nextval('public.gallery_item_images_id_seq'::regclass);


--
-- Name: gallery_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery_items ALTER COLUMN id SET DEFAULT nextval('public.gallery_items_id_seq'::regclass);


--
-- Name: hat_canvas_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hat_canvas_config ALTER COLUMN id SET DEFAULT nextval('public.hat_canvas_config_id_seq'::regclass);


--
-- Name: hat_parts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hat_parts ALTER COLUMN id SET DEFAULT nextval('public.hat_parts_id_seq'::regclass);


--
-- Name: hat_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hat_types ALTER COLUMN id SET DEFAULT nextval('public.hat_types_id_seq'::regclass);


--
-- Name: images id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images ALTER COLUMN id SET DEFAULT nextval('public.images_id_seq'::regclass);


--
-- Name: newsletter_subscribers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscribers ALTER COLUMN id SET DEFAULT nextval('public.newsletter_subscribers_id_seq'::regclass);


--
-- Name: pricing_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_config ALTER COLUMN id SET DEFAULT nextval('public.pricing_config_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_posts (id, title, slug, content, excerpt, category, featured_image_url, author, published, created_at, updated_at) FROM stdin;
1	The Art of Custom Hat Making	art-of-custom-hat-making	Custom hat making is a craft that combines tradition with modern innovation. At Caspary Hat Co., we take pride in creating unique pieces that stand out at any event...	Discover the craftsmanship behind our custom hats.	Behind the Scenes	\N	Caspary Hat Co.	t	2025-12-23 13:01:46.512536	2025-12-23 13:01:46.512536
2	Top 5 Hat Styles for Corporate Events	top-5-hat-styles-corporate-events	When planning a corporate event, the right branded merchandise can make all the difference. Custom hats offer a unique way to promote your brand while providing attendees with a memorable keepsake...	Find the perfect hat style for your next corporate event.	Style Guide	\N	Caspary Hat Co.	t	2025-12-23 13:01:46.515041	2025-12-23 13:01:46.515041
\.


--
-- Data for Name: color_combinations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.color_combinations (id, name, front_color, mesh_color, brim_color, rope_color, display_order, active) FROM stdin;
1	Classic Navy	#172c63	#ffffff	#172c63	#172c63	0	t
2	All Black	#000000	#000000	#000000	#000000	1	t
3	Texas Orange	#d18f63	#ffffff	#d18f63	#d18f63	2	t
4	Camo	#4a5c3a	#4a5c3a	#4a5c3a	#4a5c3a	3	t
5	Classic Navy	#172c63	#ffffff	#172c63	#172c63	0	t
6	All Black	#000000	#000000	#000000	#000000	1	t
7	Texas Orange	#d18f63	#ffffff	#d18f63	#d18f63	2	t
8	Camo	#4a5c3a	#4a5c3a	#4a5c3a	#4a5c3a	3	t
9	Classic Navy	#172c63	#ffffff	#172c63	#172c63	0	t
10	All Black	#000000	#000000	#000000	#000000	1	t
11	Texas Orange	#d18f63	#ffffff	#d18f63	#d18f63	2	t
12	Camo	#4a5c3a	#4a5c3a	#4a5c3a	#4a5c3a	3	t
13	Classic Navy	#172c63	#ffffff	#172c63	#172c63	0	t
14	All Black	#000000	#000000	#000000	#000000	1	t
15	Texas Orange	#d18f63	#ffffff	#d18f63	#d18f63	2	t
16	Camo	#4a5c3a	#4a5c3a	#4a5c3a	#4a5c3a	3	t
17	Classic Navy	#172c63	#ffffff	#172c63	#172c63	0	t
18	All Black	#000000	#000000	#000000	#000000	1	t
19	Texas Orange	#d18f63	#ffffff	#d18f63	#d18f63	2	t
20	Camo	#4a5c3a	#4a5c3a	#4a5c3a	#4a5c3a	3	t
\.


--
-- Data for Name: color_presets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.color_presets (id, name, hex, display_order, active) FROM stdin;
1	Navy	#172c63	0	t
2	Black	#000000	1	t
3	White	#ffffff	2	t
4	Gray	#6b7280	3	t
5	Red	#dc2626	4	t
6	Orange	#d18f63	5	t
7	Green	#16a34a	6	t
8	Royal Blue	#2563eb	7	t
9	Maroon	#7f1d1d	8	t
10	Tan	#d4a574	9	t
11	Camo Green	#4a5c3a	10	t
12	Pink	#ec4899	11	t
13	Navy	#172c63	0	t
14	Black	#000000	1	t
15	White	#ffffff	2	t
16	Gray	#6b7280	3	t
17	Red	#dc2626	4	t
18	Orange	#d18f63	5	t
19	Green	#16a34a	6	t
20	Royal Blue	#2563eb	7	t
21	Maroon	#7f1d1d	8	t
22	Tan	#d4a574	9	t
23	Camo Green	#4a5c3a	10	t
24	Pink	#ec4899	11	t
25	Navy	#172c63	0	t
26	Black	#000000	1	t
27	White	#ffffff	2	t
28	Gray	#6b7280	3	t
29	Red	#dc2626	4	t
30	Orange	#d18f63	5	t
31	Green	#16a34a	6	t
32	Royal Blue	#2563eb	7	t
33	Maroon	#7f1d1d	8	t
34	Tan	#d4a574	9	t
35	Camo Green	#4a5c3a	10	t
36	Pink	#ec4899	11	t
37	Navy	#172c63	0	t
38	Black	#000000	1	t
39	White	#ffffff	2	t
40	Gray	#6b7280	3	t
41	Red	#dc2626	4	t
42	Orange	#d18f63	5	t
43	Green	#16a34a	6	t
44	Royal Blue	#2563eb	7	t
45	Maroon	#7f1d1d	8	t
46	Tan	#d4a574	9	t
47	Camo Green	#4a5c3a	10	t
48	Pink	#ec4899	11	t
49	Navy	#172c63	0	t
50	Black	#000000	1	t
51	White	#ffffff	2	t
52	Gray	#6b7280	3	t
53	Red	#dc2626	4	t
54	Orange	#d18f63	5	t
55	Green	#16a34a	6	t
56	Royal Blue	#2563eb	7	t
57	Maroon	#7f1d1d	8	t
58	Tan	#d4a574	9	t
59	Camo Green	#4a5c3a	10	t
60	Pink	#ec4899	11	t
\.


--
-- Data for Name: contact_inquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_inquiries (id, name, email, phone, message, event_type, event_date, quantity, budget, whiteboard_image_url, file_url, status, created_at) FROM stdin;
15	Reid Caspary	rcaspary@sharewellhdd.com	2818148024	dfsd	Trucker	\N	1	\N	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1767027199/caspary-hat-co/whiteboard/iwqearyirq132cagglmy.png	\N	new	2025-12-29 10:53:20.623838
\.


--
-- Data for Name: gallery_item_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gallery_item_images (id, gallery_item_id, image_url, display_order, created_at) FROM stdin;
6	3	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517514/The_thunder_Baseball_jgryfz.jpg	0	2025-12-28 16:19:16.719449
7	3	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517514/The_Mud_Dogs_zcblz4.jpg	1	2025-12-28 16:19:16.720264
1	1	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.19_acadc270_ik9j3h.jpg	0	2025-12-28 16:19:16.707581
8	1	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766964688/caspary-hat-co/gallery/xt4apzci7dxbqlzu0oem.jpg	1	2025-12-28 17:31:35.374728
3	1	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517514/Dancers_zlksmi.jpg	2	2025-12-28 16:19:16.714937
10	2	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766965484/caspary-hat-co/gallery/fqegjtdd9xvcza3gxzms.jpg	0	2025-12-28 17:44:47.351267
9	2	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766965265/caspary-hat-co/gallery/oy5zy49ay1xqcb2wjq2r.jpg	1	2025-12-28 17:41:08.140742
\.


--
-- Data for Name: gallery_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gallery_items (id, title, category, description, display_order, active, created_at, updated_at) FROM stdin;
3	Team Hats	Team Hats	Custom Team Hats with Embroidered Mascot and Colors	2	t	2025-12-28 16:19:16.718685	2025-12-28 16:19:16.718685
1	Custom Event Hats	Event	Elegant Custom Memorabilia for Events	0	t	2025-12-28 16:19:16.701906	2025-12-28 17:37:23.093908
2	Custom Corporate Hats	Business	Premium Custom Hats for Corporate Branding	1	t	2025-12-28 16:19:16.715823	2025-12-28 17:44:56.742355
\.


--
-- Data for Name: hat_canvas_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hat_canvas_config (id, hat_type_id, width, height, front_design_x, front_design_y, front_design_width, front_design_height, back_design_x, back_design_y, back_design_width, back_design_height) FROM stdin;
1	1	400	300	100	60	200	120	100	80	200	100
2	2	400	300	100	50	200	130	100	80	200	100
\.


--
-- Data for Name: hat_parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hat_parts (id, hat_type_id, part_id, name, description, default_color, display_order) FROM stdin;
4	2	front	Front Panel	The front fabric panels	#172c63	0
5	2	brim	Bill	The hat bill/brim	#172c63	1
6	2	mesh	Mesh	The mesh back panels	#ffffff	2
7	2	rope	Rope	The decorative rope	#ffffff	3
20	1	front	Front Panel	The front fabric panels	#172c63	0
21	1	brim	Bill	The hat bill/brim	#172c63	1
22	1	mesh	Mesh	The mesh back panels	#ffffff	2
23	1	front	Front Panel	The front fabric panels	#172c63	0
24	1	brim	Bill	The hat bill/brim	#172c63	1
25	1	mesh	Mesh	The mesh back panels	#ffffff	2
26	2	front	Front Panel	The front fabric panels	#172c63	0
27	2	brim	Bill	The hat bill/brim	#172c63	1
28	2	mesh	Mesh	The mesh back panels	#ffffff	2
29	2	rope	Rope	The decorative rope	#ffffff	3
30	1	front	Front Panel	The front fabric panels	#172c63	0
31	1	brim	Bill	The hat bill/brim	#172c63	1
32	1	mesh	Mesh	The mesh back panels	#ffffff	2
33	2	front	Front Panel	The front fabric panels	#172c63	0
34	2	brim	Bill	The hat bill/brim	#172c63	1
35	2	mesh	Mesh	The mesh back panels	#ffffff	2
36	2	rope	Rope	The decorative rope	#ffffff	3
37	1	front	Front Panel	The front fabric panels	#172c63	0
38	1	brim	Bill	The hat bill/brim	#172c63	1
39	1	mesh	Mesh	The mesh back panels	#ffffff	2
40	2	front	Front Panel	The front fabric panels	#172c63	0
41	2	brim	Bill	The hat bill/brim	#172c63	1
42	2	mesh	Mesh	The mesh back panels	#ffffff	2
43	2	rope	Rope	The decorative rope	#ffffff	3
44	1	front	Front Panel	The front fabric panels	#172c63	0
45	1	brim	Bill	The hat bill/brim	#172c63	1
46	1	mesh	Mesh	The mesh back panels	#ffffff	2
47	2	front	Front Panel	The front fabric panels	#172c63	0
48	2	brim	Bill	The hat bill/brim	#172c63	1
49	2	mesh	Mesh	The mesh back panels	#ffffff	2
50	2	rope	Rope	The decorative rope	#ffffff	3
\.


--
-- Data for Name: hat_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hat_types (id, slug, name, description, category, preview_image_url, front_image_url, back_image_url, display_order, active, created_at, updated_at, front_marker_color, mesh_marker_color, brim_marker_color, rope_marker_color) FROM stdin;
1	classic	The Classic	Classic Trucker Hat with Mesh Back. Available in 5 or 6 Panels.	Mesh Back	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.19_acadc270_ik9j3h.jpg	/hats/classic-front.png	/hats/classic-back.png	0	t	2025-12-27 11:17:43.485581	2025-12-27 12:09:41.35745	#fc258f	#570ba7	#fd7603	
2	caddie	The Caddie	Classic Rope Hat with Mesh or Fabric Back. Perfect for a vintage look.	Rope Hat	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766517515/WhatsApp_Image_2025-10-27_at_16.36.18_17db9e80_ltlg0x.jpg	/hats/caddie-front.png	/hats/caddie-back.png	1	t	2025-12-27 11:17:43.515082	2025-12-27 11:17:43.515082	\N	\N	\N	\N
\.


--
-- Data for Name: images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.images (id, filename, url, cloudinary_public_id, alt_text, category, uploaded_at) FROM stdin;
1	112 - White - Front.png	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766856246/caspary-hat-co/hats/nzy1proirlvebkjpd4di.png	caspary-hat-co/hats/nzy1proirlvebkjpd4di	\N	hats	2025-12-27 11:24:07.530844
2	BlackWhiteRed.png	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766857294/caspary-hat-co/hats/r4gjbyzfbc1qiei0vbgd.png	caspary-hat-co/hats/r4gjbyzfbc1qiei0vbgd	\N	hats	2025-12-27 11:41:35.000813
3	0afbc4a6-b08e-4543-89d6-32ab5b3952de.png	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766858905/caspary-hat-co/hats/kukc8oqhlxlyul5dj9zz.png	caspary-hat-co/hats/kukc8oqhlxlyul5dj9zz	\N	hats	2025-12-27 12:08:26.372059
4	0afbc4a6-b08e-4543-89d6-32ab5b3952de.png	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766858966/caspary-hat-co/hats/nq8bpl1wm0yprhkcyltz.png	caspary-hat-co/hats/nq8bpl1wm0yprhkcyltz	\N	hats	2025-12-27 12:09:27.649312
5	WhatsApp Image 2025-11-03 at 15.52.15_6119fab8.jpg	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766964688/caspary-hat-co/gallery/xt4apzci7dxbqlzu0oem.jpg	caspary-hat-co/gallery/xt4apzci7dxbqlzu0oem	\N	gallery	2025-12-28 17:31:29.34245
6	100% Cotton.jpg	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766965265/caspary-hat-co/gallery/oy5zy49ay1xqcb2wjq2r.jpg	caspary-hat-co/gallery/oy5zy49ay1xqcb2wjq2r	\N	gallery	2025-12-28 17:41:06.078183
7	WhatsApp Image 2025-10-27 at 16.36.18_17db9e80.jpg	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766965484/caspary-hat-co/gallery/fqegjtdd9xvcza3gxzms.jpg	caspary-hat-co/gallery/fqegjtdd9xvcza3gxzms	\N	gallery	2025-12-28 17:44:44.796433
8	HAT - YOUR LOGO HERE.jpg	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766965796/caspary-hat-co/media/whoy9tgva35uxf6cnmii.jpg	caspary-hat-co/media/whoy9tgva35uxf6cnmii	\N	\N	2025-12-28 17:49:57.032216
9	WhatsApp Image 2025-12-14 at 10.21.02 PM.jpeg	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766983693/caspary-hat-co/media/nbaszcz6yubeou48oh0b.jpg	caspary-hat-co/media/nbaszcz6yubeou48oh0b	\N	\N	2025-12-28 22:48:12.877607
10	WhatsApp Image 2025-12-14 at 10.21.02 PM.jpeg	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766983792/caspary-hat-co/media/bfnln0nqpyaktwzueip8.jpg	caspary-hat-co/media/bfnln0nqpyaktwzueip8	\N	\N	2025-12-28 22:49:52.870861
11	WhatsApp Image 2025-12-14 at 10.21.02 PM.jpeg	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766984374/caspary-hat-co/media/xac1cvwzcowkxfrtpluw.jpg	caspary-hat-co/media/xac1cvwzcowkxfrtpluw	\N	\N	2025-12-28 22:59:34.460033
12	WhatsApp Image 2025-12-14 at 10.21.02 PM.jpeg	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1766984393/caspary-hat-co/media/z7dqtvkdbdgvlmvq6zwv.jpg	caspary-hat-co/media/z7dqtvkdbdgvlmvq6zwv	\N	\N	2025-12-28 22:59:53.656759
13	WhatsApp Image 2025-12-14 at 10.21.02 PM.jpeg	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1767023971/caspary-hat-co/media/nvswmlh8xrkkpt9usc2x.jpg	caspary-hat-co/media/nvswmlh8xrkkpt9usc2x	\N	\N	2025-12-29 09:59:31.613866
14	WhatsApp Image 2025-12-14 at 10.21.02 PM.jpeg	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1767025349/caspary-hat-co/media/jgsmm09jukygjq9bcmwd.jpg	caspary-hat-co/media/jgsmm09jukygjq9bcmwd	\N	\N	2025-12-29 10:22:30.268404
15	Website Logo.jpeg	https://res.cloudinary.com/dk8a8a7cc/image/upload/v1767025376/caspary-hat-co/media/eh11xidvm6fwwnyqrugx.jpg	caspary-hat-co/media/eh11xidvm6fwwnyqrugx	\N	\N	2025-12-29 10:22:57.006112
\.


--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.newsletter_subscribers (id, email, subscribed_at, active) FROM stdin;
\.


--
-- Data for Name: pricing_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pricing_config (id, config_key, config_value, updated_at) FROM stdin;
1	pricing_tiers	[{"max_quantity": 99, "min_quantity": 50, "price_per_hat": 16}, {"max_quantity": 149, "min_quantity": 100, "price_per_hat": 14}]	2025-12-29 13:04:37.534891
2	pricing_settings	{"variable": {"exponent": 2.5, "max_price": 12, "min_price": 10, "anchor_quantity": 1000}, "max_ui_quantity": 1000, "min_order_quantity": 50}	2025-12-29 13:04:37.537941
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, name, role, created_at) FROM stdin;
1	admin@casparyhatco.com	$2a$10$AKTkNtG/haKOOHLwb9.J3eW0qFxTeOVZA8DE12Bue/V066E7u9Gay	Admin	admin	2025-12-23 13:01:46.508197
3	reidc@casparyhats.com	$2a$10$xRt0DaRer6Z8UubUiN.yUOHaWWEPlbzGxxg7.XlA1OD0bcfHYh64y	Admin	admin	2025-12-29 14:27:37.867133
\.


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 12, true);


--
-- Name: color_combinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.color_combinations_id_seq', 20, true);


--
-- Name: color_presets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.color_presets_id_seq', 60, true);


--
-- Name: contact_inquiries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contact_inquiries_id_seq', 15, true);


--
-- Name: gallery_item_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gallery_item_images_id_seq', 10, true);


--
-- Name: gallery_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gallery_items_id_seq', 3, true);


--
-- Name: hat_canvas_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hat_canvas_config_id_seq', 10, true);


--
-- Name: hat_parts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hat_parts_id_seq', 50, true);


--
-- Name: hat_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hat_types_id_seq', 10, true);


--
-- Name: images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.images_id_seq', 15, true);


--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.newsletter_subscribers_id_seq', 1, false);


--
-- Name: pricing_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pricing_config_id_seq', 12, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: color_combinations color_combinations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_combinations
    ADD CONSTRAINT color_combinations_pkey PRIMARY KEY (id);


--
-- Name: color_presets color_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.color_presets
    ADD CONSTRAINT color_presets_pkey PRIMARY KEY (id);


--
-- Name: contact_inquiries contact_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_inquiries
    ADD CONSTRAINT contact_inquiries_pkey PRIMARY KEY (id);


--
-- Name: gallery_item_images gallery_item_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery_item_images
    ADD CONSTRAINT gallery_item_images_pkey PRIMARY KEY (id);


--
-- Name: gallery_items gallery_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery_items
    ADD CONSTRAINT gallery_items_pkey PRIMARY KEY (id);


--
-- Name: hat_canvas_config hat_canvas_config_hat_type_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hat_canvas_config
    ADD CONSTRAINT hat_canvas_config_hat_type_id_key UNIQUE (hat_type_id);


--
-- Name: hat_canvas_config hat_canvas_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hat_canvas_config
    ADD CONSTRAINT hat_canvas_config_pkey PRIMARY KEY (id);


--
-- Name: hat_parts hat_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hat_parts
    ADD CONSTRAINT hat_parts_pkey PRIMARY KEY (id);


--
-- Name: hat_types hat_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hat_types
    ADD CONSTRAINT hat_types_pkey PRIMARY KEY (id);


--
-- Name: hat_types hat_types_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hat_types
    ADD CONSTRAINT hat_types_slug_key UNIQUE (slug);


--
-- Name: images images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: pricing_config pricing_config_config_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_config
    ADD CONSTRAINT pricing_config_config_key_key UNIQUE (config_key);


--
-- Name: pricing_config pricing_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_config
    ADD CONSTRAINT pricing_config_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_blog_posts_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_category ON public.blog_posts USING btree (category);


--
-- Name: idx_blog_posts_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_published ON public.blog_posts USING btree (published);


--
-- Name: idx_blog_posts_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_blog_posts_slug ON public.blog_posts USING btree (slug);


--
-- Name: idx_color_presets_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_color_presets_active ON public.color_presets USING btree (active);


--
-- Name: idx_contact_inquiries_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_inquiries_status ON public.contact_inquiries USING btree (status);


--
-- Name: idx_gallery_item_images_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_item_images_item ON public.gallery_item_images USING btree (gallery_item_id);


--
-- Name: idx_gallery_item_images_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_item_images_order ON public.gallery_item_images USING btree (display_order);


--
-- Name: idx_gallery_items_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_items_active ON public.gallery_items USING btree (active);


--
-- Name: idx_gallery_items_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_items_category ON public.gallery_items USING btree (category);


--
-- Name: idx_gallery_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gallery_items_order ON public.gallery_items USING btree (display_order);


--
-- Name: idx_hat_parts_hat_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_hat_parts_hat_type ON public.hat_parts USING btree (hat_type_id);


--
-- Name: idx_hat_types_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_hat_types_active ON public.hat_types USING btree (active);


--
-- Name: idx_hat_types_slug; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_hat_types_slug ON public.hat_types USING btree (slug);


--
-- Name: idx_images_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_images_category ON public.images USING btree (category);


--
-- Name: idx_newsletter_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_newsletter_active ON public.newsletter_subscribers USING btree (active);


--
-- Name: gallery_item_images gallery_item_images_gallery_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gallery_item_images
    ADD CONSTRAINT gallery_item_images_gallery_item_id_fkey FOREIGN KEY (gallery_item_id) REFERENCES public.gallery_items(id) ON DELETE CASCADE;


--
-- Name: hat_canvas_config hat_canvas_config_hat_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hat_canvas_config
    ADD CONSTRAINT hat_canvas_config_hat_type_id_fkey FOREIGN KEY (hat_type_id) REFERENCES public.hat_types(id) ON DELETE CASCADE;


--
-- Name: hat_parts hat_parts_hat_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hat_parts
    ADD CONSTRAINT hat_parts_hat_type_id_fkey FOREIGN KEY (hat_type_id) REFERENCES public.hat_types(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 1OjO2Qe97ijNWeqJYSaYZ5m7T1QrxJBO5vXm1fnxcfLepYBVP1ikGf16bcflwev

