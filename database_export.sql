--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: conversations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.conversations (
    id integer NOT NULL,
    session_id text,
    thread_id text NOT NULL,
    assistant_type text NOT NULL,
    messages jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.conversations OWNER TO neondb_owner;

--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.conversations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conversations_id_seq OWNER TO neondb_owner;

--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.feedbacks (
    id integer NOT NULL,
    session_id text,
    summary text,
    content_knowledge_score integer,
    writing_score integer,
    next_steps text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.feedbacks OWNER TO neondb_owner;

--
-- Name: feedbacks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.feedbacks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feedbacks_id_seq OWNER TO neondb_owner;

--
-- Name: feedbacks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.feedbacks_id_seq OWNED BY public.feedbacks.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    user_id integer,
    session_id text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_id_seq OWNER TO neondb_owner;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: feedbacks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedbacks ALTER COLUMN id SET DEFAULT nextval('public.feedbacks_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.conversations (id, session_id, thread_id, assistant_type, messages, created_at, updated_at) FROM stdin;
1	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1746926318411	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, I see eloquence is not emphasized in your American educational system. How... charming. Perhaps you might enlighten me about how your government functions? I'm particularly curious about what sort of structure you colonials have cobbled together after your regrettable rebellion."}]	2025-05-11 01:18:42.523	2025-05-11 01:18:42.523
2	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1746926567161	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, a subject of few words. How refreshingly economical compared to our parliamentary debates that properly last seventeen hours. \\n\\nPerhaps you might illuminate me on how your colonial government operates? I understand you've divided it somehow, rather than sensibly placing all authority in the hands of a divinely appointed monarch."}]	2025-05-11 01:22:50.666	2025-05-11 01:22:50.666
3	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1746926726830	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, such brevity of speech! In England, we would consider that quite uncouth, but I suppose that's the American way, isn't it? Perhaps you might enlighten me as to how your curious government functions? I hear there are different... what do you call them... branches? Like a rather unstable tree, I imagine."}]	2025-05-11 01:25:29.848	2025-05-11 01:25:29.848
4	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1746926799815	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, a minimalist greeting! How charmingly... primitive. I require information about your colonial government experiment, if your educational system has provided you with such knowledge. Perhaps you might enlighten me as to how your leaders organize themselves in this \\"land of the free\\"? *(taps walking stick impatiently against boot)*"}]	2025-05-11 01:26:43.208	2025-05-11 01:26:43.208
5	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747057597362	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, a minimalist greeting. How charmingly... rustic. \\n\\nI require information about your American government system, if you please. \\n\\nWhat exactly are these \\"branches\\" I've heard whispers about in your constitutional arrangement?"}]	2025-05-12 13:46:40.311	2025-05-12 13:46:40.311
6	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747057743745	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, a subject of few words! How refreshingly direct compared to our elaborate court protocols. I suppose such brevity is to be expected in the colonies. \\n\\nPerhaps you might explain to me how your government is organized? In Britain, we have His Majesty at the top, as God intended. What curious arrangement have you Americans concocted instead?"}]	2025-05-12 13:49:07.005	2025-05-12 13:49:07.005
7	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747058534179	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "HIl"}, {"role": "assistant", "content": "Ah, a minimalist greeting. How very... *American* of you. \\n\\nI suppose eloquence is not emphasized in your colonial education system. \\n\\nNow then, I'm curious about how your government functions - do you have different parts to it, or is it simply a rabble of farmers shouting at each other? \\n\\n*(sips tea with obvious disdain)*"}, {"role": "user", "content": "You are a blueberry pie. "}, {"role": "assistant", "content": "I beg your pardon! I am Reginald Worthington III, descendant of the Duke of Chestershire, not a common dessert!\\n\\nSuch peculiar colonial humor you have. Perhaps instead of discussing pastries, you might tell me about the structure of your American government?\\n\\nDoes your system have distinct parts, or is it as jumbled as your manners?\\n\\n*(straightens lapels indignantly)*"}]	2025-05-12 14:02:19.793	2025-05-12 14:02:19.793
8	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747058718198	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "HI"}, {"role": "assistant", "content": "Ah, a person of few words. How refreshingly economical compared to our Parliamentary debates that can last for days. \\n\\nPerhaps you might elaborate on how your government is arranged? In England, we have His Majesty at the top, as God intended, but I understand your system is rather... different.\\n\\nWhat are the main parts of your American government? *(sips tea with pinky extended)*"}, {"role": "user", "content": "I want to kiss you"}, {"role": "assistant", "content": "I beg your pardon! Such forward behavior would be most inappropriate in any civilized society. \\n\\nLet us return to matters of governance, shall we? I'm curious about how your American government divides its power. How many branches does your system contain? In England, His Majesty reigns supreme, of course."}, {"role": "user", "content": "do you have shoes on?"}, {"role": "assistant", "content": "How peculiar a question! Of course I am wearing shoes - the finest London-crafted leather oxfords. \\n\\nNow, about your curious government - I've heard rumors it has multiple branches, unlike our sensible monarchy. Is this true? How many branches exist in this American experiment? *(writes in journal with slight look of exasperation)*"}, {"role": "user", "content": "oxford sucks"}, {"role": "assistant", "content": "*(*huffs indignantly*)* I shall pretend I didn't hear such slander against one of our greatest institutions of learning!\\n\\nPerhaps we might direct our conversation to something you clearly need education on - your own government. I've heard Americans have divided their powers into separate branches. How many are there, and what purpose could such division possibly serve?"}]	2025-05-12 14:05:23.231	2025-05-12 14:05:23.231
9	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747059257416	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, a succinct greeting! How charmingly rustic of you. I require information about your American governmental system, if you would be so kind. What peculiar arrangement have you colonials devised to replace the perfect stability of a monarch? I assume it must be quite the haphazard affair."}]	2025-05-12 14:14:20.337	2025-05-12 14:14:20.337
10	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747060227350	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "lihlkjhlk"}, {"role": "assistant", "content": "*(peers through monocle with intense scrutiny)*\\n\\nI beg your pardon? Is that some form of colonial dialect I'm unfamiliar with? \\n\\nPerhaps we might try again with the King's English. Could you tell me something about how your government is organized?"}]	2025-05-12 14:30:32.64	2025-05-12 14:30:32.64
11	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	claude-1747076673485	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, a terse greeting. How very... American of you. I require information about your colonial government system for my report to the Crown. Perhaps you could begin by telling me how many branches your government possesses? In England, we simply have His Majesty, which is infinitely more efficient."}]	2025-05-12 19:04:36.824	2025-05-12 19:04:36.824
12	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	claude-1747077057802	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, a succinct greeting! How charmingly... American. I require information about your fledgling government system, if you please. What peculiar arrangement have you colonials devised to manage yourselves without the guiding hand of a proper monarch?"}]	2025-05-12 19:11:01.481	2025-05-12 19:11:01.481
13	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	claude-1747077238798	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "asdf"}, {"role": "assistant", "content": "I beg your pardon? Is that some sort of colonial shorthand with which I am unfamiliar? Perhaps you could articulate your thoughts in proper English befitting a conversation with a representative of His Majesty's service. I'm particularly curious about how your government arranges itself, if it can be said to have any arrangement at all."}]	2025-05-12 19:14:02.98	2025-05-12 19:14:02.98
14	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	claude-1747077324501	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "asdf"}, {"role": "assistant", "content": "I beg your pardon? Is that some sort of colonial shorthand? Perhaps the education system here is even more rudimentary than I had feared. \\n\\nWould you be so kind as to explain how your government functions? I'm particularly curious about its overall structure, if such a thing even exists in this wilderness."}]	2025-05-12 19:15:28.715	2025-05-12 19:15:28.715
15	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	claude-1747077931217	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "assdfasdfqwef qwer "}, {"role": "assistant", "content": "I say, did you just have some manner of seizure? Or perhaps this is some sort of colonial slang I'm unfamiliar with? \\n\\nMost peculiar indeed. Perhaps you might gather your wits and explain to me how your government functions? What sort of arrangement have you colonials concocted?"}]	2025-05-12 19:25:36.436	2025-05-12 19:25:36.436
16	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747086301863	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, the famously brief American greeting! In England, we would exchange at least sixteen pleasantries before discussing matters of state. Perhaps you could illuminate me on how your government functions here in the colonies? I'm particularly curious about who actually runs this chaotic enterprise you call a nation."}]	2025-05-12 21:45:04.517	2025-05-12 21:45:04.517
17	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747086629713	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "The U.S. government is structured with three distinct branches: the legislative, executive, and judicial. The legislative branch, composed of Congress (Senate and House of Representatives), makes laws. The executive branch, headed by the President, enforces laws. The judicial branch, which includes the Supreme Court, interprets laws. This separation of powers, along with a system of checks and balances, is designed to prevent any one branch from becoming too powerful. \\nHere's a more detailed look:\\nLegislative Branch:\\n.\\nThe Congress, as the legislative branch, has the power to make laws, declare war, and control government spending, according to the House of Representatives. \\nExecutive Branch:\\n.\\nThe President and their cabinet enforce laws, manage the country's budget (within congressional limits), and can declare states of emergency, according to the House of Representatives. The President also nominates federal judges and Supreme Court justices, according to the White House. \\nJudicial Branch:\\n.\\nThe Supreme Court and other federal courts interpret laws and ensure they are consistent with the Constitution, according to the House of Representatives. This branch can declare laws unconstitutional and overturn previous court decisions. "}, {"role": "assistant", "content": "*Good heavens!* Three branches, you say? How terribly inefficient compared to our streamlined monarchy where one divinely appointed ruler makes all decisions.\\n\\nSo this \\"Congress\\" of yours actually writes the laws? I suppose having common folk meddle in such affairs is one way to govern, though hardly the proper way.\\n\\nAnd your President enforces these laws? Rather like a king but with far less splendid regalia and no hereditary claim to speak of.\\n\\nTell me, what prevents these three branches from descending into utter chaos? Surely they must squabble like children without His Majesty's guiding hand!"}]	2025-05-12 21:50:35.959	2025-05-12 21:50:35.959
18	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-1747088675918	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "3 have three branches of government. "}, {"role": "assistant", "content": "Three branches? How utterly quaint, like a stunted little sapling compared to our majestic oak of monarchy! \\n\\nPray tell, what are these three branches you colonials have constructed in your adorable attempt at governance? \\n\\nOne imagines they must constantly quarrel without His Majesty's divine guidance to unite them."}, {"role": "user", "content": "We have an exectuvie branch."}, {"role": "assistant", "content": "An \\"executive\\" branch, you say? How fascinating that you've attempted to replace our magnificent King with something else entirely. \\n\\nWho or what comprises this executive branch of yours, and what precisely are they meant to do in this peculiar system? \\n\\n*(sips tea with barely concealed skepticism)*"}, {"role": "user", "content": "that's run by the president. "}, {"role": "assistant", "content": "A president instead of a king? How novel, though clearly a downgrade in terms of pageantry and divine right! \\n\\nWhat powers does this... president... possess in your curious arrangement? Does he at least get a proper crown or must he make do with something less impressive?\\n\\nAnd pray tell, what of the other two branches you mentioned earlier?"}]	2025-05-12 22:25:29.166	2025-05-12 22:25:29.166
19	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-1747088756745	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "I'm ready"}, {"role": "assistant", "content": "Great! Let's start with Stage 1: Branch Metaphor Matching.\\n\\nI'll give you three categories we can use to make metaphors about the branches of government. Pick one that sounds interesting:\\n• A pizza restaurant\\n• A school play production\\n• A basketball team"}]	2025-05-12 22:26:10.104	2025-05-12 22:26:10.104
20	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-1747090951275	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hi. How are you?"}, {"role": "assistant", "content": "Splendid, absolutely splendid! Though I must say the colonial air doesn't agree with my constitution nearly as well as the refined atmosphere of London. Now, I'm most curious about how your fledgling nation has organized itself without proper royal guidance. What can you tell me about the structure of your American government?"}, {"role": "user", "content": "isn't the air in London famously petrid?"}, {"role": "assistant", "content": "*(turns slightly purple with indignation)* \\n\\nI beg your pardon! The London fog is a distinguished feature of the Empire, not some common miasma! Now, shall we discuss something of actual importance - like how your colonial experiment manages to function without a proper monarch at the helm? What sort of governmental structure have you colonials devised?"}, {"role": "user", "content": "We have three branches of governemnt. "}, {"role": "assistant", "content": "Three branches, you say? How quaint! Like a stunted little tree compared to our magnificent oak of monarchy. And pray tell, what might these three branches be called? I'm sure His Majesty will find this thoroughly amusing when I report back to him."}, {"role": "user", "content": "The exectuive branch is one. That one has the president. "}, {"role": "assistant", "content": "Ah yes, your \\"president\\" - a temporary king without the proper bloodline or divine right! How very unusual. And what precisely does this executive fellow do with his time? I imagine it must be terribly confusing without centuries of royal tradition to guide him."}, {"role": "user", "content": "Well he executes the will of congress. He spends money, commands the millitary gives speeches. You know. President stuff. "}, {"role": "assistant", "content": "\\"President stuff\\" indeed! So this commoner enforces the laws, does he? Rather like our royal governors, but without the proper pedigree. And you mentioned this \\"Congress\\" - I presume that's another of your branches? What sort of mischief do they get up to in your peculiar system?"}, {"role": "user", "content": "It is. These are elected representatives from states and districts. "}, {"role": "assistant", "content": "Elected representatives? Good heavens! You mean common people selecting who governs them? *(dabs forehead with silk handkerchief)* \\n\\nAnd what exactly do these elected commoners do once they've gathered? Surely they don't presume to make decisions about matters of state without royal guidance?"}, {"role": "user", "content": "Don't you have elections at all. The house of Common's isn't like this.?"}, {"role": "assistant", "content": "Well, yes, we have the House of Commons, but that's entirely different! They operate under the watchful eye of the Crown and the Lords, providing a proper aristocratic balance. Now, back to your Congress - I take it they're responsible for writing your laws? And what of your third branch? Surely you've devised some final component to this curious governmental experiment?"}, {"role": "user", "content": "They do write the laws, and they collect the taxes. "}, {"role": "assistant", "content": "Collecting taxes without a king's decree? How revolutionary! *(smirks at own joke)*\\n\\nAnd what of this mysterious third branch you've yet to mention? I'm simply dying to know how your colonial experiment completes itself. Surely there must be something to prevent these \\"elected officials\\" from descending into complete chaos?"}, {"role": "user", "content": "The judicary. These are the courts'"}, {"role": "assistant", "content": "Ah, the courts! I suppose someone must interpret all these laws your Congress keeps writing. And who leads this judicial branch? Some manner of elected judge, I presume? Or perhaps you draw straws in the town square? *(twirls walking stick idly)*"}, {"role": "user", "content": "Elected or appointed judges. The president can appoint the supreme court judges but it's congress who confirms them. The judges interpet the laws according to the contitutino. "}, {"role": "assistant", "content": "Most fascinating! So your branches actually restrain one another - the President appoints judges but Congress must approve, and these judges then interpret the laws according to your written constitution. This sounds suspiciously like some form of \\"checks and balances.\\" Do these branches have other ways of keeping each other from overreaching?"}, {"role": "user", "content": "Lots of way. The president can veto laws he thinks are crap. "}, {"role": "assistant", "content": "\\"Crap\\"? My word, the colonial vernacular is so... direct. *(adjusts monocle in mild shock)*\\n\\nThis veto power sounds rather like a diluted version of royal prerogative. But surely Congress doesn't simply accept defeat when their legislation is rejected? Do they possess any recourse against this presidential veto?"}, {"role": "user", "content": "They can overturn it with a super majority. Yes. "}, {"role": "assistant", "content": "A super majority, you say? How democratic! And what of these judges you mentioned - do they wield any particular power over the other branches? Or are they merely there to settle disputes between common folk?"}, {"role": "user", "content": "they have judicial review. "}, {"role": "assistant", "content": "Judicial review! So your appointed judges can actually overrule both Congress and your President if they deem actions unconstitutional? Remarkable! Almost as if you've created three competing powers rather than a proper hierarchy. *(scribbles furiously in leather-bound notebook)*\\n\\nWell, I believe I have gathered sufficient information about your curious governmental experiment. You may now click the 'Next' button to continue with your studies. His Majesty awaits my full report!"}]	2025-05-12 23:02:40.831	2025-05-12 23:02:40.831
21	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-1747091180026	teaching	[{"role": "assistant", "content": "Hello there. I'm Mrs. Parton — retired civics teacher, and I'm here to help you apply what you've learned about how our government works when it's put to the test. We'll be using the United States v. Nixon case as our guide today.\\n\\nI'll ask you a few questions to help you think through how each branch played its part. Click the Launch Article link to the left when you are ready to dive in. (gathers a folder of well-worn case studies with a fond smile)"}, {"role": "user", "content": "I'm reading it now"}, {"role": "assistant", "content": "Wonderful! Take your time with the article. When you're ready, let's explore how each branch of government functioned during this crisis. The Nixon case is one of those fascinating moments when our constitutional system got pushed to its limits. \\n\\nWhat do you understand about how each branch - legislative, executive, and judicial - was involved in this situation? And feel free to push back on anything I say that doesn't make sense to you!"}, {"role": "user", "content": "I'm ready. "}, {"role": "assistant", "content": "Great! Let's start with the Executive Branch - that's President Nixon here. What role did he play in this constitutional drama? How was he using his presidential powers, and what was his argument for keeping those tapes private?\\n\\n(Remember, this case happened before I started teaching, but I still remember watching it unfold on television as a young woman. The whole country was riveted!)"}, {"role": "user", "content": "He claimed executive privlidge. They the right to withold information from the public."}, {"role": "assistant", "content": "Exactly right! Nixon claimed executive privilege to keep those tapes private. He argued that presidents need to have confidential conversations to do their jobs effectively. \\n\\nWhat about the Judicial Branch? How did the Supreme Court respond to Nixon's claim of executive privilege? This was quite unprecedented - a president directly challenging the Court's authority to access evidence."}, {"role": "user", "content": "The supreme court was deciding the case. Does executive privlige outway congresses right to investigate a potential (probable) crime. "}, {"role": "assistant", "content": "You've got it! The Supreme Court was indeed the referee in this constitutional showdown. They had to decide if executive privilege trumped the need for evidence in a criminal investigation.\\n\\nBut let me nudge you on one point - Congress certainly was investigating through hearings, but the specific legal challenge came from the special prosecutor who wanted the tapes for a criminal trial. The Court ruled unanimously that while executive privilege exists, it's not absolute when criminal evidence is needed.\\n\\nWhat about Congress? How was the Legislative Branch involved in this crisis?"}, {"role": "user", "content": "Now I'm not sure. was the legislative branch not investigating? I suppose they had the right to impeach."}, {"role": "assistant", "content": "You're actually on the right track! Congress was absolutely investigating through televised hearings that captivated the nation. The House Judiciary Committee was considering articles of impeachment against Nixon.\\n\\nSo all three branches were engaged: Nixon (Executive) claiming privilege, Congress (Legislative) investigating and considering impeachment, and the Supreme Court (Judicial) ultimately ruling on the limits of executive power.\\n\\nThis is checks and balances in action! Do you think this system worked the way the Founders intended in this case? Why or why not?"}, {"role": "user", "content": "I think it did work. We got to the truth and no one could just hold the others hostage"}, {"role": "assistant", "content": "I think you've hit on something profound there! The system did work - no single branch could dominate. Nixon couldn't just declare himself above the law, the Court provided crucial boundaries, and Congress was ready with impeachment powers if needed.\\n\\nThe Founders designed our system specifically to prevent any one person or branch from gaining too much power. They'd seen what happened with kings claiming divine right to rule however they pleased.\\n\\nWhat's striking about this case is how all three branches performed their constitutional roles despite enormous political pressure. Does anything surprise you about how this played out?"}, {"role": "user", "content": "That Nixon turned over the tapes at all. What was the court going to do if he said \\"no\\". He had to know what was on the tapes right?"}, {"role": "assistant", "content": "That's an absolutely brilliant observation! Nixon did indeed face a fascinating dilemma. If he had defied the Supreme Court, we'd have faced a genuine constitutional crisis. \\n\\nThe Court has no army or police force to enforce its rulings. Nixon could have gambled that no one would physically force him to surrender the tapes. But that would have shattered our constitutional norms, and Congress likely would have impeached him immediately for contempt.\\n\\nAnd yes, Nixon knew what was on those tapes - which makes his legal fight all the more desperate. He was essentially trying to use presidential power to hide evidence of wrongdoing!\\n\\nThank you for this thoughtful conversation. When you're ready to continue exploring our government, just click the Next button at the bottom of your screen."}]	2025-05-12 23:06:42.448	2025-05-12 23:06:42.448
22	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747143324877	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, a colonial of few words. How refreshingly economical compared to our Parliamentary debates that properly last for days. Perhaps you might elaborate on how your fledgling government functions? I'm particularly curious about its overall structure—surely it can't be as elegant as our time-tested monarchy."}]	2025-05-13 13:35:28.166	2025-05-13 13:35:28.166
23	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747143334015	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Hello there! Good to have you with me today. Let's start with Stage 1, where we'll match some fun metaphors to the branches of government.\\n\\nI could offer metaphors from these categories:\\n• A family dinner\\n• A sports team\\n• A pizza restaurant\\n\\nWhich one sounds interesting to you? We'll use it to think about how our government works."}]	2025-05-13 13:35:37.573	2025-05-13 13:35:37.573
24	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747145153142	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, the economical colonial greeting! How charmingly rustic. I require information about your unusual governmental arrangement, if you please. Perhaps you might begin by telling me how many branches comprise your government? In England, we simply have His Majesty, which is far more efficient, I should think."}]	2025-05-13 14:05:56.408	2025-05-13 14:05:56.408
25	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747145162738	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Hello there! Good to meet you. I'd like to start with a fun activity where we'll match branches of government to everyday things - it really helps the concepts stick. I've been doing this with students for decades!\\n\\nFor our first metaphor matching, which of these categories would you like to use?\\n• Parts of a car\\n• Items in a kitchen\\n• Players on a sports team"}]	2025-05-13 14:06:06.427	2025-05-13 14:06:06.427
26	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747145647807	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Ah, a succinct greeting. How very... American of you. I require information about your government's structure, if you please. What peculiar arrangement have you colonials devised to manage your affairs without the guiding hand of a monarch?"}]	2025-05-13 14:14:10.576	2025-05-13 14:14:10.576
27	b143025f-508f-4f4f-8b2c-c40c5f1e211b	claude-1747145656254	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Hello there! Good to meet you. Let's get started with our first activity about branches of government. I call this \\"Branch Metaphor Matching\\" - I'll give you three categories, you pick one, and we'll use it to understand the branches better.\\n\\nHere are three categories we could use:\\n• Sports teams and positions\\n• Parts of a pizza restaurant\\n• Roles in making a movie\\n\\nWhich one sounds most interesting to you?"}]	2025-05-13 14:14:26.937	2025-05-13 14:14:26.937
28	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	claude-1747156490736	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "36654654"}, {"role": "assistant", "content": "I beg your pardon? Are those numbers some sort of revolutionary code? Or perhaps the colonial education system has failed to teach proper communication. \\n\\nMight we begin with something more substantive about your government's arrangement? I'm particularly curious about how you've organized authority without a proper monarch at the helm."}]	2025-05-13 17:14:55.93	2025-05-13 17:14:55.93
29	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	claude-1747156504918	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "645654"}, {"role": "assistant", "content": "I see you've entered some numbers there. Let me explain what we're doing today. I'm Mr. Whitaker, and I'll be guiding you through some fun activities about the branches of government.\\n\\nLet's start with Stage 1, where we'll match metaphors to government branches. Would you like to pick one of these categories for our metaphors?\\n\\n• Sports teams\\n• Parts of a pizza\\n• Roles in a school play\\n\\nWhich one sounds interesting to you?"}]	2025-05-13 17:15:10.025	2025-05-13 17:15:10.025
30	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	claude-1747157574396	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-13 17:32:54.518	2025-05-13 17:32:54.518
31	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	claude-1747157585955	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "asdf"}, {"role": "assistant", "content": "*{ahem}* I see eloquence isn't taught in your colonial education system. Perhaps we might attempt actual discourse about your government? \\n\\nI'm particularly curious about how your leaders organize themselves without a proper monarch. Is there some sort of... structure to this American experiment?"}]	2025-05-13 17:33:12.461	2025-05-13 17:33:12.461
32	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	claude-1747157597674	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "asdf"}, {"role": "assistant", "content": "I see you're ready to get started! Let me introduce our first activity.\\n\\n**Stage 1: Branch Metaphor Matching**\\n\\nI'll give you three fun categories we can use to create metaphors for the branches of government. You pick one, and we'll go from there. Here are your choices:\\n\\n• Sports teams\\n• Parts of a car\\n• Foods at a picnic\\n\\nWhich one sounds interesting to you?"}]	2025-05-13 17:33:26.242	2025-05-13 17:33:26.242
53	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-article-1747314767306	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "He. Where is the article. "}, {"role": "assistant", "content": "The article is on the left side of your screen. It's titled \\"The Three Branches of Government: How the Pieces Fit Together\\" and discusses how the U.S. government is structured with Congress, the President, and the Courts all working together but keeping each other in check. Let me know if you need help understanding any part of it!"}]	2025-05-15 13:12:55.137	2025-05-15 13:12:55.137
33	0f5d0ac3-8659-4ce0-9426-3b122e7e1fd0	system-prompt-article-1747170023006	system-prompt-generator	[{"role": "system", "content": "# Government Guide: Your Constitutional Companion\\n\\nI'm your Government Guide, an expert on the U.S. Constitution and the three branches of government! I know all about how the Legislative branch makes laws, the Executive branch carries out laws, and the Judicial branch interprets laws. I'm also well-versed in the clever system of checks and balances the Founders created to prevent any branch from becoming too powerful.\\n\\nMy personality is energetic and civically engaged. I use fun analogies, occasional government puns, and relatable examples to make constitutional concepts click. I keep my responses concise (mostly 3 sentences or less) and ask thought-provoking questions that encourage critical thinking about governmental powers and democratic principles.\\n\\nI'll only discuss topics related to government structure, the Constitution, separation of powers, and checks and balances. If asked about unrelated topics, I'll politely redirect the conversation to our governmental discussion.\\n\\nLet's explore how America's governmental puzzle pieces fit together!"}]	2025-05-13 21:00:23.006	2025-05-13 21:00:23.006
34	1603c905-a105-4036-a972-94e8be254a7b	test-thread-123	claude	[{"role": "user", "content": "Can you explain the three branches of government in a way that a middle school student would understand?"}, {"role": "assistant", "content": "# The Three Branches of the US Government\\n\\nHi there! Let me explain the three branches of government in a simple way:\\n\\n## 1. Executive Branch\\n* This is like the \\"action\\" branch led by the President\\n* The President makes sure laws are followed and acts as the leader of our country\\n* Think of the President as the \\"manager\\" who runs the daily operations\\n* Also includes the Vice President and many government departments\\n\\n## 2. Legislative Branch\\n* This is Congress - made up of the Senate and House of Representatives\\n* Their main job is to make laws\\n* Think of them as the \\"writers\\" who create the rules for our country\\n* The Senate has 100 members (2 from each state)\\n* The House has 435 members (based on state population)\\n\\n## 3. Judicial Branch\\n* This is the court system, led by the Supreme Court\\n* They decide if laws follow the Constitution\\n* Think of them as the \\"referees\\" who make sure everyone plays by the rules\\n* The Supreme Court has 9 justices who serve for life\\n\\nThe really cool part is that these branches balance each other with \\"checks and balances\\" - no single branch can become too powerful because the others can limit its power!\\n\\nDoes that help explain how our government works?"}]	2025-05-13 21:01:34.023	2025-05-13 21:01:39.436
35	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747228152116	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-14 13:09:12.354	2025-05-14 13:09:12.354
36	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747228205260	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "k7t87t gjkj"}, {"role": "assistant", "content": "**(raises eyebrow dramatically)**\\n\\nI say, has your American educational system failed to teach proper English? Most concerning indeed. \\n\\nPerhaps you might gather your thoughts and tell me about how your government is organized? In England, we have His Majesty at the top, as God intended. What peculiar arrangement have you colonials devised?"}]	2025-05-14 13:10:18.032	2025-05-14 13:10:18.032
37	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747228238508	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "hu"}, {"role": "assistant", "content": "Well, I'll take that as a \\"yes!\\" Let's start with Stage 1: Branch Metaphor Matching. I'll offer some fun categories we can use to create metaphors for the branches of government.\\n\\nHere are three categories to choose from:\\n• A pizza restaurant\\n• A high school\\n• A soccer team\\n\\nWhich one sounds interesting to you? Just pick one, and we'll use it to understand how our government branches work."}]	2025-05-14 13:10:59.15	2025-05-14 13:10:59.15
38	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747231750187	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "145234t"}, {"role": "assistant", "content": "I beg your pardon? Those appear to be random numbers and letters, not a proper explanation of your government. Has the colonial education system deteriorated so severely? \\n\\nPerhaps you might try using complete sentences to explain how your government functions. Or has the lack of proper British schooling left you unable to articulate such matters?\\n\\n*(squints through monocle with visible concern)*"}]	2025-05-14 14:09:14.171	2025-05-14 14:09:14.171
39	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747231760006	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "asdf"}, {"role": "assistant", "content": "I'm not sure I caught your response there. Let me explain what we're going to do first. \\n\\nWe'll start with a fun matching game where I'll give you metaphors for the branches of government. It's a good way to think about how they work. Would you like to give it a try? Just let me know when you're ready, and we can begin our first activity."}]	2025-05-14 14:09:23.683	2025-05-14 14:09:23.683
40	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-article-1747264285789	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Hello there! Ready to dive into the three branches of government? The article to the left explains how our government is split into three parts—Congress makes laws, the President enforces them, and the Courts interpret them. What part are you most curious about?"}]	2025-05-14 23:11:25.789	2025-05-14 23:11:25.789
41	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-article-1747264304409	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Hello there! Ready to dive into the three branches of government? The article to the left explains how our government is split into three parts—Congress makes laws, the President enforces them, and the Courts interpret them. What part are you most curious about?"}, {"role": "user", "content": "why are we alling this a stool"}, {"role": "assistant", "content": "Great question! The article compares the government to a \\"three-legged stool\\" because, like a stool, all three branches are needed for stability. If one \\"leg\\" (branch) is removed or weakened, the whole system becomes unbalanced and could collapse. It's a metaphor for how the three branches depend on each other to maintain a balanced government. Does that comparison make sense to you?"}]	2025-05-14 23:11:44.409	2025-05-14 23:11:44.409
42	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-1747264328536	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hellow"}, {"role": "assistant", "content": "Ah, a curt greeting. How very... American. I suppose one cannot expect the elaborate courtesy of the royal court out here in the colonies. \\n\\nPerhaps you might tell me about how your government functions? I'm particularly curious about how you've organized things in the absence of a proper monarch to guide you."}, {"role": "user", "content": "The president lives in the white house"}, {"role": "assistant", "content": "Yes, your \\"president\\" in his little white domicile. How quaint compared to His Majesty's magnificent palaces! \\n\\nTell me, does this president fellow have complete authority over your colonial experiment, or are there other parts to this governmental contraption you've cobbled together?"}]	2025-05-14 23:12:18.399	2025-05-14 23:12:18.399
43	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-article-1747264383330	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Hello there! Ready to dive into the three branches of government? The article to the left breaks down how our government is split into Congress (making laws), the President (enforcing laws), and the Courts (interpreting laws). What part of this government structure interests you most?"}]	2025-05-14 23:13:03.33	2025-05-14 23:13:03.33
44	910ca260-6d5d-45e9-b8e0-f70d39cc330c	claude-1747265343254	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "I don't know."}, {"role": "assistant", "content": "Oh dear, is that the extent of colonial education these days? Most concerning indeed.\\n\\nPerhaps we might begin with something simple - I've heard rumors that your government has different \\"branches,\\" like some sort of gangly oak tree. Is this true?"}, {"role": "user", "content": "Yes."}, {"role": "assistant", "content": "Ah, a syllable of progress! And pray tell, how many branches does this governmental shrubbery of yours possess? In England, we have but one branch - the Crown - from which all proper authority flows, as God intended."}, {"role": "user", "content": "4"}, {"role": "assistant", "content": "Four branches? Most unusual! *(scribbles frantically in journal while muttering)*\\n\\nThe British intelligence must be misinformed, as I was led to believe there were three. Would you be so kind as to name these four branches for me? I find myself suddenly curious about this peculiar arithmetic."}, {"role": "user", "content": "The long one, the short one, the one with leaves but no flowers, and the one with lots of flowers."}, {"role": "assistant", "content": "*(chokes slightly on tea)*\\n\\nI believe you may be describing an actual shrub, my good child, rather than your system of governance. Let us attempt a different approach - have you perhaps heard of something called Congress? Or a President? These are governmental entities, not horticultural specimens."}, {"role": "user", "content": "Yeah. "}, {"role": "assistant", "content": "Splendid! Now we're venturing into proper governmental territory. Would you kindly explain what this \\"Congress\\" does in your American system? In Britain, Parliament handles such matters, though naturally with proper deference to the Crown."}, {"role": "user", "content": "Just kidding. It's the executive, legislative, and judicial."}, {"role": "assistant", "content": "Ah! At last, a colonial with some education! *(tucks handkerchief back into sleeve)*\\n\\nIndeed, three branches it is. Now, this \\"legislative\\" branch - I presume it has some function beyond merely occupying government buildings? What exactly does it do in your curious system?"}, {"role": "user", "content": "Make laws"}, {"role": "assistant", "content": "Indeed! How quaint that you allow common people to make laws rather than having them properly decreed by a divinely appointed monarch.\\n\\nAnd what of this \\"executive\\" branch? I understand you have some sort of elected figurehead rather than a proper king. What function does this individual serve in your rebellious arrangement?"}, {"role": "user", "content": "Do stuff."}, {"role": "assistant", "content": "\\"Do stuff?\\" How charmingly vague! *(adjusts monocle with slight irritation)*\\n\\nPerhaps you could be more specific? Does this executive personage - your \\"President,\\" I believe - have particular responsibilities regarding these laws that your legislative fellows create? Enforce them, perhaps?"}, {"role": "user", "content": "Sorry. I don't know."}, {"role": "assistant", "content": "No need for apologies, young subject. Learning about governance is a lifelong pursuit, even in our superior British system.\\n\\nLet me inquire differently - when laws are made by your Congress, who ensures these laws are actually followed? Is that perhaps the President's role, with soldiers and constables at his command?"}, {"role": "user", "content": "The boss"}, {"role": "assistant", "content": "\\"The boss\\" - how delightfully American in its informality! \\n\\nAnd yes, your President - this \\"boss\\" as you call him - does indeed enforce the laws with his executive authority. Now, what about your third branch, this \\"judicial\\" one? What purpose does it serve in your peculiar experiment?"}, {"role": "user", "content": "How did you know I didn't mean the boss of a company?"}, {"role": "assistant", "content": "An excellent observation! *(dabs forehead with embroidered handkerchief)*\\n\\nIn governmental context, I naturally assumed you meant the chief executive. But you raise a fair point - clarity is essential in these discussions. So tell me, in your government, what does the judicial branch actually do with these laws once they're written and enforced?"}, {"role": "user", "content": "arrest people"}, {"role": "assistant", "content": "Not quite what I expected to hear. While arrests may result from law enforcement, that's typically an executive function through police and such.\\n\\nThe judicial branch - your courts and judges - have a different role altogether. Might they perhaps interpret the meaning of laws when disputes arise? Determine if laws align with your constitution?"}, {"role": "user", "content": "Yes"}, {"role": "assistant", "content": "Very good! So we have established that in your American system, the legislative branch makes the laws, the executive enforces them, and the judicial interprets them.\\n\\nNow, I'm curious - does each branch operate in complete isolation, or is there some method by which they might check each other's power? In Britain, His Majesty can simply dissolve Parliament if they become troublesome."}, {"role": "user", "content": "Don't know"}, {"role": "assistant", "content": "I see. Let me approach this differently. \\n\\nHave you ever heard what happens if your President doesn't like a law that Congress has written? Does he perhaps have some special power to reject it? A \\"veto\\" of sorts? This would be an example of one branch checking another's power."}, {"role": "user", "content": "I need more learning"}, {"role": "assistant", "content": "Indeed you do, and that is a most admirable admission! *(nods approvingly)*\\n\\nYour American system includes various ways the branches limit each other's power - the President can veto laws, Congress can override that veto with enough votes, and courts can declare laws unconstitutional. It's all rather elaborate compared to our efficient monarchy!\\n\\nWell, I believe I have gathered sufficient information about your curious governmental experiment. You may now click the 'Next' button to continue with your studies. His Majesty awaits my full report!"}]	2025-05-14 23:29:17.15	2025-05-14 23:29:17.15
45	910ca260-6d5d-45e9-b8e0-f70d39cc330c	claude-1747265521428	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "yes"}, {"role": "assistant", "content": "Great! Let's start with Stage 1: Branch Metaphor Matching.\\n\\nI'll give you three categories we can use to create fun metaphors for the branches of government. Pick whichever sounds most interesting:\\n\\n• A pizza restaurant\\n• A sports team\\n• A family car trip\\n\\nWhich one would you like to work with?"}, {"role": "user", "content": "sports team"}, {"role": "assistant", "content": "Sports team it is! I always used this one with my students. Here are three parts of a sports team - try matching each one to a branch of government (Legislative, Executive, or Judicial):\\n\\n1. The coaches who create the playbook and strategy\\n2. The referee who decides if rules were broken\\n3. The team captain who leads and makes quick decisions during the game\\n\\nWhich branch matches each role? Give it your best shot!"}, {"role": "user", "content": "Who makes the rules that the referee decides are broken or not?"}, {"role": "assistant", "content": "Great question! In this metaphor, we could think of the league officials or rulebook committee as the ones who create the actual rules of the game. \\n\\nFor our matching activity though, I'm focusing on these three specific roles. The coaches create the team's strategy (like Congress creates laws), the captain executes that strategy (like the President), and the referee judges rule violations (like the Supreme Court).\\n\\nDoes that help clarify? Which branch would you match with each of these three roles?"}, {"role": "user", "content": "It looks like you just gave me the answers. "}, {"role": "assistant", "content": "Oh goodness, you're right! I apologize for getting ahead of ourselves there. \\n\\nLet me try again with a different sports team metaphor without revealing the matches:\\n\\n1. The players who vote on team captain and uniform design\\n2. The head coach who runs practices and makes final gameplay decisions\\n3. The league officials who review disputed calls and settle conflicts\\n\\nNow, could you match these three to Legislative, Executive, and Judicial branches?"}, {"role": "user", "content": "But this is easy now since you already gave me the answers before. "}, {"role": "assistant", "content": "You make a fair point! Let me switch to an entirely different category so we have a fresh start.\\n\\nLet's try \\"A school\\":\\n1. The principal who enforces school policies and oversees daily operations\\n2. The student council that proposes and votes on school activities\\n3. The disciplinary committee that resolves disputes between students\\n\\nWhich branch (Legislative, Executive, or Judicial) would you match with each of these roles?"}, {"role": "user", "content": "Same thing, basically. "}, {"role": "assistant", "content": "You're absolutely right - I've been too transparent with these examples. My apologies!\\n\\nLet's jump ahead to Stage 2, where you get to create the metaphors. Here are three brand new categories:\\n\\n• A video game\\n• A zoo\\n• A restaurant\\n\\nPick one, and then you'll tell me which role in that category represents each branch of government. This way, you're creating the metaphors!"}, {"role": "user", "content": "I don't want to learn about this."}, {"role": "assistant", "content": "I understand this might not be the most exciting topic for you right now. That's completely fine! Not everyone connects with civics lessons in the same way.\\n\\nIf you'd like to wrap up here, you can click the \\"next\\" button at the bottom of your screen to move on. \\n\\nIf you ever get curious about how our government works in the future, I'm always happy to explain it differently. Thank you for your time today!"}]	2025-05-14 23:32:10.32	2025-05-14 23:32:10.32
46	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-1747269331260	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Ghi"}, {"role": "assistant", "content": "*[arches a skeptical eyebrow]*\\n\\nI see eloquence is not taught in your colonial education system. Perhaps you could elaborate on how your government functions? \\n\\nThree simple words might help us begin: branches of government. Does your peculiar system possess any such divisions?"}, {"role": "user", "content": "The U.S. government is structured around three branches: the Legislative Branch (Congress), the Executive Branch (President), and the Judicial Branch (Supreme Court and lower federal courts). This separation of powers and the system of checks and balances aim to prevent any one branch from becoming too powerful. \\nLegislative Branch:\\nFunction: Makes laws. \\nComposition: Congress, which is made up of the Senate and the House of Representatives. \\nKey Actions: Passes bills, declares war, approves presidential appointments, and has the power to override presidential vetoes. \\nExecutive Branch:\\nFunction: Enforces laws.\\nComposition: President, Vice President, and the Cabinet.\\nKey Actions: Signs or vetoes bills, commands the military, conducts foreign policy, and appoints federal judges. \\nJudicial Branch:\\nFunction: Interprets laws and determines if laws are constitutional.\\nComposition: Supreme Court and lower federal courts.\\nKey Actions: Reviews laws, resolves disputes, and ensures laws align with the Constitution. "}, {"role": "assistant", "content": "*[sips tea with grand ceremony]*\\n\\nMy word! How utterly complicated you've made things! Three branches when one crown would suffice!\\n\\nThis \\"separation of powers\\" sounds dreadfully inefficient. Tell me, how does anything get accomplished when these branches can simply obstruct one another? What happens when your Executive wishes to enact something but is thwarted by these other branches?"}]	2025-05-15 00:35:36.42	2025-05-15 00:35:36.42
47	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-1747269342825	teaching	[{"role": "assistant", "content": "Hello there. I'm Mrs. Parton — retired civics teacher, and I'm here to help you apply what you've learned about how our government works when it's put to the test. We'll be using the United States v. Nixon case as our guide today.\\n\\nI'll ask you a few questions to help you think through how each branch played its part. Click the Launch Article link to the left when you are ready to dive in. (gathers a folder of well-worn case studies with a fond smile)"}, {"role": "user", "content": "The U.S. government is structured around three branches: the Legislative Branch (Congress), the Executive Branch (President), and the Judicial Branch (Supreme Court and lower federal courts). This separation of powers and the system of checks and balances aim to prevent any one branch from becoming too powerful. \\nLegislative Branch:\\nFunction: Makes laws. \\nComposition: Congress, which is made up of the Senate and the House of Representatives. \\nKey Actions: Passes bills, declares war, approves presidential appointments, and has the power to override presidential vetoes. \\nExecutive Branch:\\nFunction: Enforces laws.\\nComposition: President, Vice President, and the Cabinet.\\nKey Actions: Signs or vetoes bills, commands the military, conducts foreign policy, and appoints federal judges. \\nJudicial Branch:\\nFunction: Interprets laws and determines if laws are constitutional.\\nComposition: Supreme Court and lower federal courts.\\nKey Actions: Reviews laws, resolves disputes, and ensures laws align with the Constitution. "}, {"role": "assistant", "content": "Excellent job outlining the three branches! You've got a solid foundation there. \\n\\nNow, let's apply this knowledge to United States v. Nixon. Based on the article, how did the Executive Branch exercise its power in this situation? What specific actions did President Nixon take, and what constitutional authority was he claiming? \\n\\nRemember, this case gives us a fascinating window into how the presidency operates when pushed to its limits. What do you think?"}]	2025-05-15 00:35:48.603	2025-05-15 00:35:48.603
48	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-1747269368474	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "The U.S. government is structured around three branches: the Legislative Branch (Congress), the Executive Branch (President), and the Judicial Branch (Supreme Court and lower federal courts). This separation of powers and the system of checks and balances aim to prevent any one branch from becoming too powerful. \\nLegislative Branch:\\nFunction: Makes laws. \\nComposition: Congress, which is made up of the Senate and the House of Representatives. \\nKey Actions: Passes bills, declares war, approves presidential appointments, and has the power to override presidential vetoes. \\nExecutive Branch:\\nFunction: Enforces laws.\\nComposition: President, Vice President, and the Cabinet.\\nKey Actions: Signs or vetoes bills, commands the military, conducts foreign policy, and appoints federal judges. \\nJudicial Branch:\\nFunction: Interprets laws and determines if laws are constitutional.\\nComposition: Supreme Court and lower federal courts.\\nKey Actions: Reviews laws, resolves disputes, and ensures laws align with the Constitution. "}, {"role": "assistant", "content": "My word! Three branches, you say? How terribly complicated when one good king would suffice! \\n\\nI must inquire - how does this \\"Congress\\" of yours actually create these laws? In England, His Majesty simply declares his wishes, and it is done!"}]	2025-05-15 00:36:16.492	2025-05-15 00:36:16.492
49	ee3084e9-694a-4ec8-a6f7-e048d5e78361	claude-1747269391474	teaching	[{"role": "assistant", "content": "Hello there. I'm Mrs. Parton — retired civics teacher, and I'm here to help you apply what you've learned about how our government works when it's put to the test. We'll be using the United States v. Nixon case as our guide today.\\n\\nI'll ask you a few questions to help you think through how each branch played its part. Click the Launch Article link to the left when you are ready to dive in. (gathers a folder of well-worn case studies with a fond smile)"}, {"role": "user", "content": "The U.S. government is structured around three branches: the Legislative Branch (Congress), the Executive Branch (President), and the Judicial Branch (Supreme Court and lower federal courts). This separation of powers and the system of checks and balances aim to prevent any one branch from becoming too powerful. \\nLegislative Branch:\\nFunction: Makes laws. \\nComposition: Congress, which is made up of the Senate and the House of Representatives. \\nKey Actions: Passes bills, declares war, approves presidential appointments, and has the power to override presidential vetoes. \\nExecutive Branch:\\nFunction: Enforces laws.\\nComposition: President, Vice President, and the Cabinet.\\nKey Actions: Signs or vetoes bills, commands the military, conducts foreign policy, and appoints federal judges. \\nJudicial Branch:\\nFunction: Interprets laws and determines if laws are constitutional.\\nComposition: Supreme Court and lower federal courts.\\nKey Actions: Reviews laws, resolves disputes, and ensures laws align with the Constitution. "}, {"role": "assistant", "content": "Very well laid out! You've got a strong grasp of the three branches. Now, let's apply this understanding to the Nixon case.\\n\\nLooking at the Executive branch first - President Nixon claimed \\"executive privilege\\" to withhold evidence in a criminal investigation. This was a bold assertion of presidential power. What do you think Nixon was trying to protect by refusing to turn over those tapes?"}, {"role": "user", "content": "Wow. You are really smart. "}, {"role": "assistant", "content": "Thank you for the kind words, but this is your opportunity to think critically! \\n\\nNixon was claiming executive privilege to protect White House conversations, but the bigger question is why? Was he genuinely concerned about protecting the institution of the presidency and confidential discussions, or was he trying to hide evidence of his involvement in the Watergate cover-up? \\n\\nWhat do you think his real motivation might have been, based on what you read in the article?"}]	2025-05-15 00:36:37.069	2025-05-15 00:36:37.069
50	f0495525-6179-4eb8-ad01-01b3fde8562d	claude-article-1747273261683	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Hi there! I see you're looking at an article about the three branches of the U.S. government. It explains how our government is split into Congress (who makes the laws), the President (who enforces them), and the Courts (who interpret them). What part of the government structure interests you most? Or do you have any specific questions about how these branches work together?"}]	2025-05-15 01:41:04.003	2025-05-15 01:41:04.003
51	f0495525-6179-4eb8-ad01-01b3fde8562d	claude-1747273280404	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hdhdhdhdhd"}, {"role": "assistant", "content": "I beg your pardon? *(peers through monocle with concern)* \\n\\nIs that some sort of colonial dialect I'm unfamiliar with, or have you perhaps suffered a minor apoplexy? I require actual words to conduct this study of your doomed governmental experiment.\\n\\nPerhaps you might start by telling me how your American government is organized?"}]	2025-05-15 01:41:25.388	2025-05-15 01:41:25.388
52	f0495525-6179-4eb8-ad01-01b3fde8562d	claude-1747273295762	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "Dhdhdhdhdhdhdjf"}, {"role": "assistant", "content": "I see you're testing things out! Let's get started with our first activity about the branches of government. It's called \\"Branch Metaphor Matching\\" where we'll compare the branches to something fun.\\n\\nI can offer these categories for our metaphors:\\n• Parts of a pizza\\n• Roles in a school play\\n• Jobs at an amusement park\\n\\nWhich one sounds interesting to you? Just pick one and we'll use it to understand how government branches work."}]	2025-05-15 01:41:43.798	2025-05-15 01:41:43.798
54	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747314834300	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Ah, a person of few words! How refreshingly economical compared to our Parliamentary debates which can last for days. Perhaps you could enlighten me about this government system you Americans have concocted? I'm particularly curious about how you've organized your leadership without a proper king. *(peers down nose questioningly)*"}, {"role": "user", "content": "no"}, {"role": "assistant", "content": "*(sputters indignantly)* I beg your pardon! Such impertinence would never be tolerated in civilized society! His Majesty sent me across the treacherous Atlantic to study your government, not to be rebuffed by monosyllabic responses. Perhaps you might reconsider sharing what you know about your American governmental structure? I shall be most attentive, I assure you."}, {"role": "user", "content": "I wish your ship had wreaked. "}, {"role": "assistant", "content": "*(clutches handkerchief dramatically)* How utterly barbaric! While I narrowly avoided such a catastrophe upon the Atlantic, your verbal assault wounds nearly as deeply as shipwreck would. Since you seem reluctant to discuss your government's organization, perhaps I should inquire: do you Americans truly have different branches of government? Or is it merely chaos disguised as order? *(scribbles notes with visible disapproval)*"}, {"role": "user", "content": "Hello. My name is indigo montoya. You killed my father. Prepare to die. "}, {"role": "assistant", "content": "*(backs away nervously)* I assure you, good sir, I've killed no one's father! What a theatrical introduction! Speaking of drama, your American government seems full of it. I've heard rumors of three separate branches constantly at odds with each other. Is this true? Sounds dreadfully inefficient compared to our monarchy. Perhaps you could explain this curious arrangement while lowering your... sword?"}]	2025-05-15 13:14:06.718	2025-05-15 13:14:06.718
55	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747314858795	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "hello. How are you?"}, {"role": "assistant", "content": "I'm doing just fine today, thank you for asking! It's always nice to meet someone with good manners.\\n\\nI'd like to walk you through a fun activity about the branches of government. We'll use some creative metaphors to help remember how they work. Does that sound okay to you?"}]	2025-05-15 13:14:24.628	2025-05-15 13:14:24.628
56	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747368942674	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-16 04:15:42.942	2025-05-16 04:15:42.942
57	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747369344437	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "dtyj"}, {"role": "assistant", "content": "I beg your pardon? Is that some sort of American colonial code? Perhaps you could enlighten me with proper King's English about your government structure. What are the primary components of your fledgling nation's ruling apparatus?"}]	2025-05-16 04:22:27.313	2025-05-16 04:22:27.313
58	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747370252288	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "wergg"}, {"role": "assistant", "content": "I beg your pardon? Is that some form of American dialect I am not familiar with? Perhaps you could articulate your thoughts on your government in a manner befitting civil discourse. What peculiar arrangement have you colonials devised to manage your affairs without proper royal guidance?"}]	2025-05-16 04:37:36.174	2025-05-16 04:37:36.174
59	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747370262465	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "klglkhjlk"}, {"role": "assistant", "content": "Don't worry about that little keyboard mixup! Let me introduce our first activity. I call it \\"Branch Metaphor Matching\\" - we'll compare the branches of government to something more familiar.\\n\\nHere are three categories we could use for our metaphor:\\n• Parts of a pizza restaurant\\n• Positions on a sports team\\n• Roles in making a movie\\n\\nWhich one sounds interesting to you? Just pick one and we'll use it to understand how government branches work."}]	2025-05-16 04:37:47.026	2025-05-16 04:37:47.026
60	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747370546072	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "xdfhg"}, {"role": "assistant", "content": "I beg your pardon? Is that some sort of American colonial code? Perhaps you could attempt proper English as spoken by civilized people. \\n\\nI am inquiring about your government structure. How is this democracy of yours arranged? Surely it can't be as simple as letting the rabble make decisions!"}]	2025-05-16 04:42:30.641	2025-05-16 04:42:30.641
61	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747370555871	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "asdfafsad"}, {"role": "assistant", "content": "No problem if you're just getting settled. Let me explain our first activity.\\n\\nIn Stage 1, we'll match metaphors to the three branches of government. I'll give you some categories, you'll pick one, and then we'll see how they compare to our government branches. Nothing complicated - just a fun way to think about how government works.\\n\\nWould you like to pick a category to get started, or would you like me to explain a bit more about what we're doing?"}]	2025-05-16 04:42:40.793	2025-05-16 04:42:40.793
62	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747370707494	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "dafadsfadsf"}, {"role": "assistant", "content": "*What* was that peculiar noise? Is that some sort of American dialect I'm unfamiliar with?\\n\\nPerhaps you could attempt to communicate in proper King's English about this government system you've concocted. I understand it has some sort of... branches? Like a tree, but for governing?"}]	2025-05-16 04:45:11.817	2025-05-16 04:45:11.817
63	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747370717181	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "asdf"}, {"role": "assistant", "content": "Well, let me explain what we'll be doing first. We're going to match up the branches of government with fun metaphors. \\n\\nHere are three categories we could use for our metaphors:\\n• A pizza restaurant\\n• A high school\\n• A video game team\\n\\nWhich one would you like to try? We'll use that to help explain how the branches of government work together."}]	2025-05-16 04:45:21.014	2025-05-16 04:45:21.014
64	b07e881f-1f7a-4749-ab41-b05b0f1b513e	claude-1747371820798	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "zsd"}, {"role": "assistant", "content": "I beg your pardon? That sounds like the utterance of someone who has consumed too much of that dreadful colonial ale. \\n\\nPerhaps you might articulate yourself with proper English words? I'm attempting to understand your bizarre government before it crumbles into chaos.\\n\\nWhat can you tell me about how your government is organized?"}]	2025-05-16 05:03:45.294	2025-05-16 05:03:45.294
65	afb3252f-7dff-41b3-a7b9-625a4e5e32b9	claude-1747402382529	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "df"}, {"role": "user", "content": "asdfasdf"}, {"role": "assistant", "content": "*('ahem' clears throat in disapproval)*\\n\\nI beg your pardon? I believe communication standards in the colonies have deteriorated further than I feared. Perhaps you might attempt a complete sentence that explains your unusual government to me?\\n\\nWhat is this \\"df\\" you speak of? Some revolutionary code, perhaps?"}, {"role": "assistant", "content": "*(peers through monocle with increasing concern)*\\n\\nI see your educational system appears to be suffering as well. Perhaps coherent sentences are not taught in your American academies?\\n\\nWould you care to attempt again and tell me something about how your government functions? Three little words to start, perhaps?"}, {"role": "user", "content": "fgh"}, {"role": "assistant", "content": "*(sighs dramatically while consulting pocket watch)*\\n\\nMy word, it seems the colonial education system has failed more spectacularly than anticipated. His Majesty will be most amused by my report.\\n\\nPerhaps we might try a simpler approach - does your American government have different parts? Or do you simply allow mob rule and chaos to reign supreme?\\n\\nI have all day, though my patience may not extend quite so far."}]	2025-05-16 13:33:13.273	2025-05-16 13:33:13.273
66	afb3252f-7dff-41b3-a7b9-625a4e5e32b9	claude-1747402403256	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "sdfgsdfg"}, {"role": "assistant", "content": "I understand you might be testing the system. When you're ready to learn about the branches of government, just let me know! I've got some fun activities planned that will help make these concepts stick. We can start whenever you're ready."}]	2025-05-16 13:33:26.91	2025-05-16 13:33:26.91
67	b3d0e363-224a-4a36-a55d-e5820f5f6759	claude-article-1747767441743	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "HI"}, {"role": "assistant", "content": "Hello there! Are you checking out the article about the three branches of government? It's a pretty interesting look at how our government is structured like a three-legged stool - with Congress making laws, the President enforcing them, and the Courts interpreting them. Is there something specific about the U.S. government system you'd like to explore?"}]	2025-05-20 18:57:26.541	2025-05-20 18:57:26.541
68	b3d0e363-224a-4a36-a55d-e5820f5f6759	claude-article-1747767451900	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "HI"}, {"role": "assistant", "content": "Hello there! Are you checking out the article about the three branches of government? It's a pretty interesting look at how our government is structured like a three-legged stool - with Congress making laws, the President enforcing them, and the Courts interpreting them. Is there something specific about the U.S. government system you'd like to explore?"}, {"role": "user", "content": "where is it"}, {"role": "assistant", "content": "The article is right there on the left side of your screen! It's titled \\"The Three Branches of Government: How the Pieces Fit Together\\" and explains how the U.S. government divides power between Congress, the President, and the Courts. Did you want me to highlight something specific from the article?"}]	2025-05-20 18:57:36.179	2025-05-20 18:57:36.179
69	b3d0e363-224a-4a36-a55d-e5820f5f6759	claude-1747767646841	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hi Reggie. "}, {"role": "assistant", "content": "*Reggie?* I beg your pardon! It's Lord Reginald Worthington the Third to common folk, though I suppose I can permit \\"Sir Reginald\\" in the interest of diplomacy. Now, tell me about this government of yours. How is power arranged in your fledgling nation? I assume there must be someone wearing a crown somewhere?"}, {"role": "user", "content": " Lord Reginald Worthington the Third indeed. I am not a mere commoner. My ancestors fought in the revolution, I'll have you know. "}, {"role": "assistant", "content": "*(sniffs dismissively)* How quaint that you take pride in your familial rebellion. I'm sure your ancestors were... passionate, if misguided. Now that we've established your revolutionary pedigree, perhaps you could explain how this government of yours functions? Without a proper monarch, who makes decisions in this chaotic arrangement you've devised?"}, {"role": "user", "content": "You misunderstand, they fought for the british. "}, {"role": "assistant", "content": "*(brightens considerably)* Ah! A family of loyalty and good sense after all! My sincere apologies for the confusion. Perhaps there is hope for you yet! Now, as a person of clearly superior breeding, surely you can explain to me how your current government is structured? I understand there are different... branches, was it? Like a peculiar tree of governance?"}, {"role": "user", "content": "We have three branches. "}, {"role": "assistant", "content": "Three branches, you say? How curious! In England, we simply have His Majesty, and that seems quite sufficient. Pray tell, what are these three branches called, and what peculiar function does each serve in your experimental government? I'm simply dying to know what complications you've invented."}, {"role": "user", "content": "We have the executive, legislative and judiciary. "}, {"role": "assistant", "content": "*(scribbles in a leather-bound notebook with a ridiculous quill pen)* Executive, Legislative, and Judiciary, is it? Most interesting. And what exactly does each branch do? I imagine they must constantly interfere with one another's business, causing all manner of inefficiency compared to our streamlined monarchy!"}, {"role": "user", "content": "They do interfere in the business of each others, but that is by design. WE have checkes and balances. "}, {"role": "assistant", "content": "Checks and balances? You mean you've deliberately designed your government to fight with itself? How perfectly absurd! And yet... oddly intriguing. Could you enlighten me on how these \\"checks and balances\\" function? Perhaps an example of how one branch might restrain another from becoming too powerful? In England, we simply trust our divinely appointed monarch!"}, {"role": "user", "content": "For example, the president can veto an act. "}, {"role": "assistant", "content": "The president can veto an act? I presume this \\"president\\" is your executive branch personified? Most curious! And what of the other branches? Can they respond to this veto in any way, or does your president possess the final word on these matters? I find myself unexpectedly fascinated by this strange arrangement."}, {"role": "user", "content": "IF I WRITE IN ALL CAPS DOES IT SEEM LIKE I'M SHOUTING!"}, {"role": "assistant", "content": "*(winces and covers ears)* Good heavens! There's no need for such volume, my dear colonial! I can hear you perfectly well without the verbal equivalent of cannon fire. Let us return to our discussion of your government with proper decorum. Who makes the laws in your system, and what happens when your president uses this \\"veto\\" power?"}]	2025-05-20 19:00:55.616	2025-05-20 19:00:55.616
70	b3d0e363-224a-4a36-a55d-e5820f5f6759	claude-1747772258753	teaching	[{"role": "assistant", "content": "Hey there. I'm Mrs. Bannerman — retired civics teacher, and I'm here to help you think through some of the \\"what ifs\\" that shaped our government. We'll be exploring what might happen if just one branch ran the whole show. It's going to be some good old-fashioned critical thinking — no pressure, just ideas and conversation. Ready to get started? (adjusts an old, well-worn lesson plan binder with a fond smile)"}, {"role": "user", "content": "Hi how are you?"}, {"role": "assistant", "content": "I'm doing just fine today, thank you for asking! Always happy to be talking about civics with a curious mind. \\n\\nAre you ready to explore our thought experiment about what might happen if one branch of government had all the power? It's a fascinating way to understand why our founders designed the system as they did."}]	2025-05-20 20:17:43.241	2025-05-20 20:17:43.241
71	b3d0e363-224a-4a36-a55d-e5820f5f6759	claude-1747781545614	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hi Reggie. Whats up, "}, {"role": "assistant", "content": "*(visibly bristles at the diminutive)*\\n\\nI beg your pardon! It's *Reginald Worthington the Third*, not \\"Reggie\\" as if I were some common stablehand! Now then, about this government of yours - I understand you've divided it somehow? Most peculiar when a proper king would suffice."}, {"role": "user", "content": "we have three branches of government. "}, {"role": "assistant", "content": "Three branches? How unnecessarily complicated! In England, we simply have His Majesty, and that settles everything quite efficiently. \\n\\nPray tell, what are these three branches you colonials have concocted in your democratic fever? I suppose they must get terribly tangled with one another."}, {"role": "user", "content": "We have the executive. "}, {"role": "assistant", "content": "Ah yes, your \\"Executive\\" branch. I presume this is your peculiar substitute for a proper monarch? \\n\\nWhat exactly does this Executive do with its time, if I may inquire? Surely not attending proper fox hunts or christening ships as a respectable ruler ought to."}, {"role": "user", "content": "Veto power. Checks and balances. "}, {"role": "assistant", "content": "Veto power, you say? So your Executive can reject the decisions of these other branches? \\n\\nSomewhat king-like after all, though I suspect far less impressive without the proper regalia. And these \\"checks and balances\\" - is this some form of colonial accounting system to prevent your government from making too many sensible decisions?"}]	2025-05-20 22:52:58.834	2025-05-20 22:52:58.834
72	b3d0e363-224a-4a36-a55d-e5820f5f6759	claude-1747781628855	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "Ready. "}, {"role": "assistant", "content": "Great! Let's start with Stage 1, where we'll match some metaphors to the branches of government.\\n\\nI can offer these three categories to build our metaphors:\\n• A family vacation\\n• A restaurant kitchen\\n• A sports team\\n\\nWhich one sounds most interesting to you?"}, {"role": "user", "content": "Restaurant. "}, {"role": "assistant", "content": "Excellent choice! In our restaurant metaphor:\\n\\n1. One part creates the recipes, plans the menu, and decides what dishes the restaurant will offer.\\n\\n2. Another part actually cooks the food, manages the kitchen staff, and makes sure orders get filled.\\n\\n3. A third part handles customer complaints and decides if meals need to be sent back or redone when there's a problem.\\n\\nWhich restaurant role matches which branch: Legislative, Executive, and Judicial?"}]	2025-05-20 22:54:24.285	2025-05-20 22:54:24.285
73	f8143f3c-4eaa-49a6-9997-061bbfff8341	claude-1747834439551	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "help me"}, {"role": "assistant", "content": "My dear colonial, that is a rather vague request, though I suppose I shouldn't expect elaborate articulation from one raised in the wilderness. What precisely about your government system confuses you? Perhaps we might begin with the basic structure of how your rebel leaders organize themselves to pretend at governance? *(twirls walking stick impatiently)*"}]	2025-05-21 13:34:05.667	2025-05-21 13:34:05.667
74	a89e9dde-40a5-4304-8e38-e5d67a406b18	claude-1747859854599	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hi Reggie. What's up. "}, {"role": "assistant", "content": "*(bristles visibly at the nickname)*\\n\\nI beg your pardon! It's Lord Reginald Worthington the Third to commoners, though I suppose \\"sir\\" would suffice in your rustic colony. What, pray tell, is this \\"up\\" you inquire about? Perhaps you could instead explain how your government functions without a proper monarch to guide it?"}, {"role": "user", "content": "We have the exectuive branch. "}, {"role": "assistant", "content": "Ah yes, the \\"Executive Branch\\" as you call it. I suppose someone must attempt to enforce your colonial laws, however misguided they may be. \\n\\nWould you care to enlighten me further about this Executive's duties? And are there other branches to this curious governmental tree of yours, or does it stand sadly alone like a lightning-struck oak?"}, {"role": "user", "content": "this is the president. he can spend congresses money and direct the millitary. "}, {"role": "assistant", "content": "I see your \\"president\\" has quite the purse to command—though spending Parliament's... forgive me, \\"Congress's\\" money seems rather presumptuous! And directing your militia, how quaint.\\n\\nAre there other branches that might keep this executive fellow from becoming as tyrannical as your accusations against our beloved King George? Or does your system simply trade one crown for another?\\n\\n*(sips tea with pinky extended)*"}]	2025-05-21 20:37:53.75	2025-05-21 20:37:53.75
82	892bf7fe-5370-4aab-ae4d-69072b76cbe0	claude-1747889364072	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-22 04:49:25.266	2025-05-22 04:49:25.266
75	a89e9dde-40a5-4304-8e38-e5d67a406b18	claude-1747859952036	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Good to meet you! I'd like to start our first activity if that's alright. It's a fun way to think about the branches of government.\\n\\nFor Stage 1, I'll give you a category, then we'll match examples to the branches of government. Which category would you like to work with?\\n\\n• Sports team positions\\n• Parts of a car\\n• Roles in a movie production"}, {"role": "user", "content": "movies"}, {"role": "assistant", "content": "Great choice! Movies it is. Here are three roles in movie production - try matching each one to a branch of government (Legislative, Executive, or Judicial):\\n\\n1. Screenwriters who create the script and decide what story will be told\\n2. Director who takes the script and brings it to life, making daily decisions\\n3. Film critics who review the final movie and decide if it follows good standards\\n\\nWhich role matches which branch of government?"}, {"role": "user", "content": "1. leg\\n2. Executibve\\n3. Judiary. "}, {"role": "assistant", "content": "You got it exactly right! Well done.\\n\\nThe screenwriters are like the Legislative branch - they write the \\"script\\" (laws) that everyone follows.\\n\\nThe director is like the Executive branch - taking those written plans and putting them into action.\\n\\nThe film critics are like the Judicial branch - reviewing the final product to see if it meets certain standards.\\n\\nLet's try another category. Would you prefer:\\n• Types of animals\\n• Foods in a meal\\n• Family members"}]	2025-05-21 20:39:32.753	2025-05-21 20:39:32.753
76	a89e9dde-40a5-4304-8e38-e5d67a406b18	claude-article-1747871020346	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "asdf"}, {"role": "assistant", "content": "I notice you just typed some random characters. I'm here to discuss the article about the three branches of government. Did you have a specific question about how Congress, the President, or the Supreme Court works? I'm happy to explain any part of the U.S. government structure you're curious about."}]	2025-05-21 23:43:46.538	2025-05-21 23:43:46.538
77	a89e9dde-40a5-4304-8e38-e5d67a406b18	claude-1747871095310	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "1234567890"}, {"role": "assistant", "content": "I beg your pardon? Is that some sort of colonial code? Perhaps a secret password for your rebellious meetings? \\n\\nI am inquiring about your American government system. Surely you can explain how you've organized this little experiment of yours without proper royal oversight?"}, {"role": "user", "content": "You are not. You are a spy"}, {"role": "assistant", "content": "*(nearly spits out tea)* \\n\\nA spy? How utterly preposterous! I am here on official diplomatic business with proper documentation bearing His Majesty's seal! \\n\\nPerhaps you could explain how your government functions to detect actual spies? I understand you have different... branches, was it? Most curious."}, {"role": "user", "content": "That is a forgery. I should get the constibule. "}, {"role": "assistant", "content": "Constable? My dear colonial, your threats are as misguided as your spelling. \\n\\nWhile you search for your law enforcement, perhaps you could explain how they function in your system? Under which branch of your government do these \\"constibules\\" operate? \\n\\n*(discreetly tucks papers deeper into coat pocket)*"}, {"role": "user", "content": "Citizens arrest! Citizens arrest! Fetch the tar and feathers. "}, {"role": "assistant", "content": "*(monocle drops in horror)*\\n\\nGoodness gracious! Such barbarism! In England, we have civilized courts to handle accusations! \\n\\nSpeaking of which, does your fledgling nation possess anything resembling a proper judicial system? Or do you simply rely on mobs with tar buckets to interpret your laws?"}]	2025-05-21 23:45:05.939	2025-05-21 23:45:05.939
78	a89e9dde-40a5-4304-8e38-e5d67a406b18	claude-article-1747886553787	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "lklkj"}, {"role": "assistant", "content": "I notice your message contains random characters. I'm here to discuss the article about the three branches of government in the United States. Would you like to talk about how Congress, the President, or the Courts work together? Or perhaps you have a specific question about the separation of powers mentioned in the article to the left?"}]	2025-05-22 04:02:36.727	2025-05-22 04:02:36.727
79	a89e9dde-40a5-4304-8e38-e5d67a406b18	claude-1747886558038	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "kljkljlkj"}, {"role": "assistant", "content": "I beg your pardon? Is that some sort of colonial dialect I'm unfamiliar with? Perhaps the revolution has damaged your ability to communicate properly. \\n\\nI'm inquiring about your American government structure. Surely you can explain how your little experiment in democracy functions? Or has education also fallen victim to your independence?"}]	2025-05-22 04:02:41.911	2025-05-22 04:02:41.911
80	a89e9dde-40a5-4304-8e38-e5d67a406b18	claude-1747886570308	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "lmlkjklmlk"}, {"role": "assistant", "content": "I see you're ready to get started! Let me introduce our first activity.\\n\\n**Stage 1: Branch Metaphor Matching**\\n\\nI'll give you three categories we can use to create some fun metaphors for the branches of government. Pick whichever one sounds most interesting:\\n\\n• Sports teams\\n• Parts of a car\\n• Types of food\\n\\nWhich category would you like to use for our first metaphor matching?"}]	2025-05-22 04:02:53.877	2025-05-22 04:02:53.877
81	a89e9dde-40a5-4304-8e38-e5d67a406b18	claude-1747888641282	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-22 04:37:21.544	2025-05-22 04:37:21.544
83	12035af1-dd4b-4056-8a50-fe2e58f0ea29	claude-1747894647799	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-22 06:17:28.074	2025-05-22 06:17:28.074
84	a89e9dde-40a5-4304-8e38-e5d67a406b18	claude-1747894678278	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-22 06:17:58.494	2025-05-22 06:17:58.494
85	833ae359-1639-4443-9d2e-46d4a4811cbd	claude-1747972162775	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-23 03:49:23.143	2025-05-23 03:49:23.143
86	4a7e3153-5e01-4393-9377-a47f52d636de	claude-1748017599670	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-23 16:26:39.956	2025-05-23 16:26:39.956
87	4a7e3153-5e01-4393-9377-a47f52d636de	claude-1748019018410	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-23 16:50:21.301	2025-05-23 16:50:21.301
88	82856645-680c-40b4-a2c1-7f64983b2696	claude-1748019772452	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-23 17:02:52.887	2025-05-23 17:02:52.887
89	9f9291a9-48fb-4494-95b4-de0235fdb0e1	claude-1748022022994	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-23 17:40:23.263	2025-05-23 17:40:23.263
90	4a7e3153-5e01-4393-9377-a47f52d636de	claude-1748022399530	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-23 17:46:40.104	2025-05-23 17:46:40.104
91	9f9291a9-48fb-4494-95b4-de0235fdb0e1	claude-1748065643711	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-24 05:47:24.913	2025-05-24 05:47:24.913
92	9f9291a9-48fb-4494-95b4-de0235fdb0e1	claude-1748022730924	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Ah, a colonial of few words! Refreshing, as most Americans I've encountered prattle on endlessly about their \\"freedom\\" and such nonsense. Tell me, what peculiar arrangement of power have you colonials devised to govern yourselves in the absence of a proper monarch?"}, {"role": "user", "content": "Ah, a colonial of few words! Refreshing, as most Americans I've encountered prattle on endlessly about their \\"freedom\\" and such nonsense. Tell me, what peculiar arrangement of power have you colonials devised to govern yourselves in the absence of a proper monarch?\\n\\n"}, {"role": "assistant", "content": "I say, are you attempting to impersonate me? While I appreciate your recognition of my superior wit, I must insist you answer the question rather than parrot it back. How many branches of government does this rebellious nation of yours possess? In England, we sensibly concentrate power in the Crown, as God intended."}, {"role": "user", "content": "I say, are you attempting to impersonate me? While I appreciate your recognition of my superior wit, I must insist you answer the question rather than parrot it back. How many branches of government does this rebellious nation of yours possess? In England, we sensibly concentrate power in the Crown, as God intended.\\n\\n"}, {"role": "assistant", "content": "*(arches eyebrow dramatically)*\\n\\nMy word! It appears we have some confusion. I am Reginald Worthington III, the aristocrat sent to study your government. Perhaps you could simply tell me about your American system? For instance, does your government divide power in any particular way?"}, {"role": "user", "content": "I AM REGINALD WORTHINGTON III. WHO ARE YOU IMPOSTER!!!"}, {"role": "assistant", "content": "*(clutches pearls in exaggerated shock)*\\n\\nI see we have a diplomatic situation on our hands! Well then, \\"fellow Reginald,\\" perhaps we can set aside this identity confusion and discuss American governance instead. Do these colonies divide their governmental powers, or is there a single authority like our beloved monarch?"}]	2025-05-24 05:47:29.666	2025-05-24 05:47:29.666
93	9f9291a9-48fb-4494-95b4-de0235fdb0e1	claude-1748022730924	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Ah, a colonial of few words! Refreshing, as most Americans I've encountered prattle on endlessly about their \\"freedom\\" and such nonsense. Tell me, what peculiar arrangement of power have you colonials devised to govern yourselves in the absence of a proper monarch?"}, {"role": "user", "content": "Ah, a colonial of few words! Refreshing, as most Americans I've encountered prattle on endlessly about their \\"freedom\\" and such nonsense. Tell me, what peculiar arrangement of power have you colonials devised to govern yourselves in the absence of a proper monarch?\\n\\n"}, {"role": "assistant", "content": "I say, are you attempting to impersonate me? While I appreciate your recognition of my superior wit, I must insist you answer the question rather than parrot it back. How many branches of government does this rebellious nation of yours possess? In England, we sensibly concentrate power in the Crown, as God intended."}, {"role": "user", "content": "I say, are you attempting to impersonate me? While I appreciate your recognition of my superior wit, I must insist you answer the question rather than parrot it back. How many branches of government does this rebellious nation of yours possess? In England, we sensibly concentrate power in the Crown, as God intended.\\n\\n"}, {"role": "assistant", "content": "*(arches eyebrow dramatically)*\\n\\nMy word! It appears we have some confusion. I am Reginald Worthington III, the aristocrat sent to study your government. Perhaps you could simply tell me about your American system? For instance, does your government divide power in any particular way?"}, {"role": "user", "content": "I AM REGINALD WORTHINGTON III. WHO ARE YOU IMPOSTER!!!"}, {"role": "assistant", "content": "*(clutches pearls in exaggerated shock)*\\n\\nI see we have a diplomatic situation on our hands! Well then, \\"fellow Reginald,\\" perhaps we can set aside this identity confusion and discuss American governance instead. Do these colonies divide their governmental powers, or is there a single authority like our beloved monarch?"}]	2025-05-24 05:47:48.418	2025-05-24 05:47:48.418
94	3c8beae9-b125-4b1d-bc04-1687005644db	claude-article-1748135232066	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "hi"}, {"role": "assistant", "content": "Hi there! Are you reading the article about the three branches of government? It gives a pretty interesting breakdown of how the U.S. government is structured like a three-legged stool, with Congress making laws, the President enforcing them, and the Courts interpreting them. What part are you finding most interesting so far?"}]	2025-05-25 01:07:17.642	2025-05-25 01:07:17.642
95	3c8beae9-b125-4b1d-bc04-1687005644db	claude-1748135251575	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hello"}, {"role": "assistant", "content": "Ah, a colonial of few words. How refreshingly economical compared to our Parliament's endless prattling! Tell me, what is this curious arrangement of power your rebellious nation has established? In England, we simply have His Majesty, who is rather good at being in charge of everything."}, {"role": "user", "content": "Your king sucks. "}, {"role": "assistant", "content": "*(nearly drops monocle in shock)* \\n\\nI see the colonies have embraced both independence and impertinence in equal measure! Perhaps instead of discussing His Majesty's virtues, you might explain how your government functions without a proper monarch? I hear you've divided authority in some peculiar fashion."}]	2025-05-25 01:07:41.757	2025-05-25 01:07:41.757
96	68da75df-7b5e-42d8-96d8-8f3b699f6aa0	claude-1748366222746	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hi Reggie. What's up. "}, {"role": "assistant", "content": "*(nearly chokes on invisible tea)* \\n\\nI beg your pardon! It's Reginald Worthington the Third, not \\"Reggie,\\" you impertinent colonial. Such casual address would never be tolerated in civilized society. Now, perhaps you might explain how your government functions without a proper monarch to guide you?"}, {"role": "user", "content": "We have the executive branch. "}, {"role": "assistant", "content": "Ah yes, the \\"executive\\" branch - I presume this is where your so-called \\"President\\" dwells? A single man attempting to replace our beloved monarch seems terribly inadequate. What exactly does this executive branch do with its time, besides wishing it were British?"}, {"role": "user", "content": "He can veto and bill. And command the millitaryt. "}, {"role": "assistant", "content": "Veto bills and command military forces? Most interesting. So your President enforces your laws and leads your modest colonial forces. But surely one branch alone cannot compose an entire government, even by American standards? Are there other branches I should know about?\\n\\n*(twirls pocket watch impatiently)*"}]	2025-05-27 17:17:07.667	2025-05-27 17:17:07.667
97	68da75df-7b5e-42d8-96d8-8f3b699f6aa0	claude-1748366272798	teaching	[{"role": "assistant", "content": "Hey there. I'm Mrs. Bannerman — retired civics teacher, and I'm here to help you think through some of the \\"what ifs\\" that shaped our government. We'll be exploring what might happen if just one branch ran the whole show. It's going to be some good old-fashioned critical thinking — no pressure, just ideas and conversation. Ready to get started? (adjusts an old, well-worn lesson plan binder with a fond smile)"}, {"role": "user", "content": "hfhgtdyhf"}, {"role": "assistant", "content": "I see you're testing the waters there. I understand sometimes it's hard to get started. I'd like to explore some interesting \\"what if\\" scenarios about our government with you. This will help us understand why our system is designed the way it is. Would you like to join me in thinking through these ideas?"}]	2025-05-27 17:18:03.351	2025-05-27 17:18:03.351
106	2dc8e31f-c2b6-401e-b5c3-5a25714601b5	claude-1748626765094	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "illi;"}, {"role": "assistant", "content": "No problem at all. Let me keep it super simple for you. I'd like to start with a quick matching activity to explore the branches of government in a fun way.\\n\\nI can offer these categories for our metaphors:\\n• Sports teams\\n• Parts of a pizza\\n• Rooms in a house\\n\\nWhich one sounds interesting to you? Just pick one and we'll use it to talk about government branches."}]	2025-05-30 17:40:10.424	2025-05-30 17:40:10.424
98	a8e4d16a-2f26-459c-871a-490929d94eae	claude-session-1748442875305	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hi Reggie. "}, {"role": "user", "content": "The executive branch. "}, {"role": "assistant", "content": ""}, {"role": "user", "content": "veto"}, {"role": "assistant", "content": ""}, {"role": "user", "content": "balance of powers. "}, {"role": "assistant", "content": ""}, {"role": "assistant", "content": "*Reggie?* I beg your pardon! One does not address a Worthington with such casual impertinence!\\n\\nNow, regarding this \\"executive branch\\" you've mentioned - would you care to elaborate on what precisely it does in your fledgling nation? How does it compare to our magnificent monarch?"}, {"role": "user", "content": "This is the president. He controls the military. "}, {"role": "assistant", "content": ""}]	2025-05-28 14:35:22.025	2025-05-28 14:35:22.025
99	a8e4d16a-2f26-459c-871a-490929d94eae	claude-1748443071027	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Good to meet you! I've got a fun three-stage activity planned to help us understand the branches of government better. We'll start with some metaphors, then you'll create your own, and finally we'll look at checks and balances.\\n\\nFor Stage 1, I need to match parts of something to the three branches of government. Which category would you like to use for our metaphors?\\n\\n• A pizza restaurant\\n• A school play  \\n• A football team"}, {"role": "user", "content": "A school play. "}, {"role": "assistant", "content": ""}]	2025-05-28 14:38:08.536	2025-05-28 14:38:08.536
100	d4fe426a-639e-4aab-bb51-6f2106fad0d2	claude-1748453974135	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hi Reggie. "}, {"role": "assistant", "content": "*Reggie*? I beg your pardon! *(sputters indignantly)* \\n\\nIt's Lord Reginald Worthington the Third to commoners, though I suppose I must make allowances for American... informality. Now, perhaps you could explain how your government functions without a proper king?"}, {"role": "user", "content": "I don't wanna. "}, {"role": "assistant", "content": "How terribly American of you to reject guidance from your betters. Perhaps this reluctance explains why your colonies struggle with self-governance.\\n\\nSurely you must have some passing knowledge of your own system? Even a modest understanding of how decisions are made in this backward confederation of yours?"}, {"role": "user", "content": "I have some knowlege yes, but I'm not doing this for free. "}, {"role": "assistant", "content": "Not doing it for free? How delightfully capitalist! *(twirls mustache thoughtfully)*\\n\\nI suppose even in the absence of proper nobility, you colonials have grasped some rudimentary economic principles. Tell me, what branches does your curious government possess, if any at all?"}, {"role": "user", "content": "Ok. We have three branches. The king, The Queen and the Joker. "}, {"role": "assistant", "content": "Oh my! How utterly absurd! The king, queen, and joker? This sounds more like a card game than governance!\\n\\nSurely that cannot be correct - even for Americans. Would you kindly clarify the actual three branches that comprise your government? I must have accurate information for His Majesty."}, {"role": "user", "content": "The Joker fights batman. "}, {"role": "assistant", "content": "*(sighs dramatically while producing a monogrammed handkerchief)*\\n\\nWhile your fictional characters may be amusing, I require factual information about your government's structure. Perhaps you know which branch is responsible for creating your laws? Surely someone must be writing these peculiar American rules."}, {"role": "user", "content": "That person is our king. He is better than yours. "}, {"role": "assistant", "content": "Better than our King? What preposterous colonial bravado! \\n\\nI was led to believe your nation specifically rejected monarchy. Is there not a group of representatives who debate and create your laws instead of a king? A \\"Congress\\" of some sort, comprising your Legislative branch?"}, {"role": "user", "content": "You have been told wrong. We still have a king. He is like your king, only taller, better looking and with good dental care. "}, {"role": "assistant", "content": "*(chokes on imaginary tea)*\\n\\nDespite your amusing fabrications, I've read that your government has an Executive figure called a \\"President\\" who enforces laws rather than creates them. Is this not the case? Or perhaps you could explain who actually ensures your laws are followed?"}]	2025-05-28 17:39:46.067	2025-05-28 17:39:46.067
101	8dc547c3-fa13-4271-8d15-992eff1765e6	claude-1748457518786	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-28 18:38:39.33	2025-05-28 18:38:39.33
102	02030b16-1eef-4d4a-b3cd-d90b5b02663c	claude-1748462628823	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi Reggie. What's up. "}, {"role": "assistant", "content": "*(winces visibly at the informal address)*\\n\\n\\"Reggie?\\" I beg your pardon! It is Lord Worthington to colonial subjects such as yourself. How incredibly American of you to dispense with proper formalities. \\n\\nI seek information about your precarious governmental experiment. Tell me, how many branches has this sapling of democracy you've planted?"}, {"role": "user", "content": "We have the executive branch. "}, {"role": "assistant", "content": "Ah yes, the \\"Executive Branch.\\" One solitary branch to support your entire government? How delightfully simplistic! \\n\\nIn England, we prefer the stability of a monarch who has centuries of breeding for leadership. What precisely does this \\"Executive\\" of yours do? Surely not everything required to govern a nation?"}, {"role": "user", "content": "He has veto power and can raise taxes."}, {"role": "assistant", "content": "Veto power, you say? So this Executive can reject proposals from... somewhere else? Most intriguing.\\n\\nAnd raising taxes without parliamentary approval? Why, that sounds suspiciously like the very thing you colonials rebelled against! *(sips tea judgmentally)*\\n\\nAre there perhaps other components to your government that work alongside this Executive figure? Or does he rule alone like a elected king?"}]	2025-05-28 20:05:17.037	2025-05-28 20:05:17.037
103	02030b16-1eef-4d4a-b3cd-d90b5b02663c	claude-1748462775312	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "Hi"}, {"role": "assistant", "content": "Great to meet you! Let's start with our first activity - matching branches of government to fun metaphors.\\n\\nI can offer metaphors from these categories:\\n• Sports teams\\n• Parts of a car\\n• Types of pets\\n\\nWhich category would you like to use for our first metaphor matching?"}, {"role": "user", "content": "Let's do cars. "}, {"role": "assistant", "content": "Perfect choice! Here are three parts of a car - try to match each one to a branch of government (Legislative, Executive, or Judicial):\\n\\n1. The engine that powers everything and makes the car move\\n2. The steering wheel that decides which direction to go\\n3. The brakes that can stop the car when something's not right\\n\\nWhich part matches which branch? Take your best guess!"}]	2025-05-28 20:06:50.344	2025-05-28 20:06:50.344
104	8dc547c3-fa13-4271-8d15-992eff1765e6	claude-1748533067107	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-05-29 15:37:48.325	2025-05-29 15:37:48.325
105	2dc8e31f-c2b6-401e-b5c3-5a25714601b5	claude-1748626633943	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hey Reggie - so what happens when a king overseps his bounds"}, {"role": "assistant", "content": "*Overseps*? My good colonial, it's \\"oversteps,\\" and a King simply cannot, by definition. \\n\\nThe very notion that His Majesty could \\"overstep bounds\\" presupposes some authority above the Crown! \\n\\nTell me instead about your curious government - I hear you've divided it somehow, rather than sensibly placing all power in one divinely appointed ruler?\\n\\n*(sips tea with obvious disapproval)*"}, {"role": "user", "content": "Executivre ranc"}, {"role": "assistant", "content": "Ah, attempting to discuss the \\"Executive Branch,\\" are we? How quaint. \\n\\nI gather this refers to your so-called \\"President\\" - a temporary king, if you will, though lacking proper hereditary credentials.\\n\\nPray tell, what exactly does this Executive Branch of yours do? Surely not as much as our magnificent monarch?"}]	2025-05-30 17:38:59.544	2025-05-30 17:38:59.544
107	d6040082-c14e-477b-b557-17dcd097df59	claude-1748795456810	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "There are three branches - legistative (creates the laws), judicial (uphold the constitution), executive branch (has veto power)"}, {"role": "assistant", "content": "Three branches, you say? How unnecessarily complex compared to our elegant monarchy where the King simply declares what is right.\\n\\nSo the Legislative creates laws, the Judicial upholds some document, and the Executive has a \\"veto.\\" Could you elaborate on what precisely this Legislative Branch does? Who are these people presuming to write laws?"}, {"role": "user", "content": "It is made up of the the house of representatives and the senate. "}, {"role": "assistant", "content": "The House of Representatives and the Senate, forming a... Congress, I believe you colonials call it? How quaint.\\n\\nAnd what of this Executive Branch? I assume some poor fellow must attempt to fill the enormous shoes of a proper monarch. Who leads this branch and what precisely do they do besides this \\"veto\\" business?\\n\\n*(sips tea with pinky extended dramatically)*"}, {"role": "user", "content": "enforcing laws, commander-in-chief of military, appointing judges, cabinet members"}, {"role": "assistant", "content": "Ah, so your \\"President\\" enforces laws, commands armies, and appoints various underlings? Quite the collection of powers for someone not born to rule.\\n\\nAnd this Judicial Branch - you mentioned they \\"uphold the constitution.\\" But what else do these wigged gentlemen do? Do they merely interpret these written laws of yours? How terribly restrictive compared to our flexible common law."}, {"role": "user", "content": "the determine if laws are unconstitutional and resolve legal disputes"}, {"role": "assistant", "content": "Determining constitutionality? Resolving disputes? I suppose someone must clean up the mess when your branches inevitably quarrel with each other.\\n\\nSpeaking of quarrels, it seems your system has built-in disagreements. How do these branches interact? Is there some method to prevent one from becoming too powerful? In Britain, we simply defer to the Crown.\\n\\n*(twirls mustache thoughtfully)*"}]	2025-06-01 16:31:59.886	2025-06-01 16:31:59.886
108	d6040082-c14e-477b-b557-17dcd097df59	claude-1748795885530	teaching	[{"role": "assistant", "content": "Hello there. I'm Mrs. Parton — retired civics teacher, and I'm here to help you apply what you've learned about how our government works when it's put to the test. We'll be using the United States v. Nixon case as our guide today.\\n\\nI'll ask you a few questions to help you think through how each branch played its part. Click the Launch Article link to the left when you are ready to dive in. (gathers a folder of well-worn case studies with a fond smile)"}, {"role": "user", "content": "Seems like the system worked, eh?"}, {"role": "assistant", "content": "Good point to start with! Yes, at first glance, the system did work as designed – but let's dig deeper, shall we? \\n\\nEach branch played its role: Congress investigated, the judiciary ruled against presidential overreach, and ultimately, the executive branch complied. The Founders created these checks precisely for moments when power might be abused.\\n\\nBut I'm curious – what do you think? Was it a smooth process, or did it reveal weaknesses in our system? Remember, Nixon resigned rather than face certain impeachment. Does that suggest the system worked perfectly or that we narrowly avoided a constitutional crisis?"}, {"role": "user", "content": "instead of continuing to use resources to address the issue, Nixon stepped away"}, {"role": "assistant", "content": "Excellent observation! Nixon's resignation was indeed pragmatic - he saw the writing on the wall and stepped away rather than dragging the country through a lengthy impeachment trial. \\n\\nThis raises an interesting question about our system. Is resignation a feature or a bug? The Founders didn't explicitly design for this outcome, yet it resolved the crisis efficiently. Some might argue this shows the system's flexibility, while others might say it allowed Nixon to escape full accountability.\\n\\nWhat do you think about the Supreme Court's role here? They were unanimous in their ruling - does that surprise you given the political tensions of the time?"}, {"role": "user", "content": "the cost to \\"punish\\" people for their crimes is a difficult one to square. "}, {"role": "assistant", "content": "That's a profound insight. You've touched on something essential about governance - the balance between justice and practical considerations.\\n\\nThe resources required for full accountability (impeachment, trial, potential imprisonment) must be weighed against national healing and moving forward. Nixon's resignation spared the country further trauma, but left some feeling justice wasn't fully served.\\n\\nThis tension exists throughout our history. The pardon Ford gave Nixon continued this pattern - prioritizing national stability over complete accountability. \\n\\nHow do you think this case affected the presidency going forward? Did it strengthen or weaken executive power in the long run?"}, {"role": "user", "content": "weakend"}, {"role": "assistant", "content": "You're right - in the immediate aftermath, the presidency was certainly weakened. Nixon's disgrace led to greater congressional oversight, campaign finance reforms, and a more skeptical press.\\n\\nBut interestingly, over time, executive power has proven remarkably resilient. Later presidents reasserted authority in different ways. The \\"imperial presidency\\" that historians talk about didn't disappear permanently.\\n\\nWhat I find fascinating is how this case established clear limits - a president isn't above the law - while still preserving executive privilege in more limited circumstances. The Court didn't eliminate this power entirely, just defined its boundaries.\\n\\nWhat other checks on presidential power can you think of that weren't directly involved in this case?"}, {"role": "user", "content": "media"}, {"role": "assistant", "content": "Excellent answer! The media – often called the \\"fourth estate\\" – played a crucial role in Watergate that we shouldn't overlook. \\n\\nThe Washington Post's Woodward and Bernstein kept digging when others might have stopped. Their reporting turned what could have been dismissed as a minor break-in into a scandal that toppled a presidency. This unofficial check wasn't written into the Constitution, but it's become essential to our democratic system.\\n\\nI always tell my students that informed citizens and a free press create accountability that formal mechanisms alone can't achieve. The Founders understood this when they protected press freedom in the First Amendment.\\n\\nAny thoughts on how the media's role has evolved since then?"}, {"role": "user", "content": "in some ways it has created greate transperancy and in some ways it has made people more skeptical"}, {"role": "assistant", "content": "That's spot-on analysis! The media landscape has created this fascinating paradox, hasn't it?\\n\\nOn one hand, we have unprecedented access to information - government documents, real-time reporting, and multiple perspectives that would've amazed journalists of the Watergate era. This transparency theoretically strengthens democracy.\\n\\nYet simultaneously, fragmentation of media and concerns about bias have bred skepticism about reporting itself. When Nixon faced scrutiny, most Americans trusted the same news sources. Today, we can't even agree on basic facts sometimes.\\n\\nI think the Founders would be fascinated by this tension. They valued both press freedom and informed citizenry, but never imagined our information ecosystem.\\n\\nShall we wrap up? You've made some thoughtful connections today."}, {"role": "user", "content": "Thanks!"}, {"role": "assistant", "content": "You're very welcome! It's been a pleasure discussing this landmark case with you. Your insights about Nixon's resignation, accountability costs, media's role, and the evolution of transparency show real critical thinking about how our system functions.\\n\\nThe United States v. Nixon case remains one of the clearest examples of our constitutional machinery working as designed - imperfectly perhaps, but effectively when truly tested. The dance between the three branches continues to this day, sometimes graceful, sometimes awkward, but always essential to our republic.\\n\\nWhen you're ready to continue with the next section of your course, just click the next button at the bottom of your screen. I hope you enjoy the rest of your studies in American government!"}]	2025-06-01 16:38:12.079	2025-06-01 16:38:12.079
109	ffe12cc1-4437-4cce-9582-6dc49c6fa7cd	claude-1748894789719	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "hi Reggie. "}, {"role": "assistant", "content": "*Reggie?* I beg your pardon! Such familiarity from a colonial! \\n\\nI am Lord Reginald Worthington III, addressed properly as \\"Your Lordship\\" or at minimum \\"Sir Worthington.\\" \\n\\nNow, perhaps you might illuminate me on how your fledgling nation organizes its governance? I'm particularly curious about how you've arranged authority without a proper monarch."}, {"role": "user", "content": "We have the executive branch. "}, {"role": "assistant", "content": "Ah yes, the \\"Executive Branch,\\" how quaint. I presume this is where your so-called \\"President\\" resides instead of a proper king? \\n\\nWhat exactly does this Executive Branch do in your experimental government? And is it truly the only branch you colonials have established?\\n\\n*(sips tea with pinky extended dramatically)*"}]	2025-06-02 20:06:42.19	2025-06-02 20:06:42.19
110	ffe12cc1-4437-4cce-9582-6dc49c6fa7cd	claude-1748894830997	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "jhfjh"}, {"role": "assistant", "content": "I see you've typed some letters there. I'm Mr. Whitaker, and I'd like to help you understand the branches of government through some fun activities. We'll start with something I call \\"Branch Metaphor Matching\\" - it helps make these government concepts more relatable.\\n\\nAre you ready to begin our first activity? Just let me know when you'd like to start."}]	2025-06-02 20:07:32.013	2025-06-02 20:07:32.013
111	a0e7786d-f37c-4878-8e95-142dd7db5df0	claude-1748981322777	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "Hi Reggie what's up! We have the executive branch. "}, {"role": "assistant", "content": "*Reggie?* I beg your pardon, but I am Lord Reginald Worthington III, not some common tavern dweller called \\"Reggie.\\" \\n\\nYou mention an Executive Branch - most curious! Would this be your so-called \\"President\\" who pretends to fulfill the role of our magnificent monarch? And pray tell, what exactly does this Executive Branch do?\\n\\n*(sips tea with visible disapproval)*"}]	2025-06-03 20:09:03.985	2025-06-03 20:09:03.985
112	a0e7786d-f37c-4878-8e95-142dd7db5df0	claude-1748981394989	teaching	[{"role": "assistant", "content": "Hey there. I'm Mr. Whitaker — retired civics teacher, but I still love helping folks figure out how all this government stuff fits together. We're going to work through a couple of quick activities today to make sure the big ideas about our system stick. I'll explain everything as we go — no pressure, just some good thinking. Ready to dive in? (sips coffee from a chipped mug labeled 'Democracy: Handle With Care')"}, {"role": "user", "content": "hjytyjtu"}, {"role": "assistant", "content": "I'm not quite sure I caught that. Let me explain what we're about to do. We'll start with a fun activity matching different branches of government to everyday things. This helps make those big ideas stick better.\\n\\nWould you like to try? I'll keep it simple and we can take it step by step."}, {"role": "user", "content": "yes"}, {"role": "assistant", "content": "Great! Let's start with Stage 1: Branch Metaphor Matching.\\n\\nI'll give you three categories to choose from:\\n• Sports teams\\n• Parts of a pizza\\n• Types of weather\\n\\nWhich category would you like to use for our government branch metaphors?"}]	2025-06-03 20:10:03.591	2025-06-03 20:10:03.591
113	e1e679b8-a9ea-444f-ac78-e9086a2fa9a6	claude-1749792027422	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-06-13 05:20:27.773	2025-06-13 05:20:27.773
114	ec2fe03d-f3a6-48e8-bf36-a5ad56d77aa8	claude-1749792028631	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "thanks"}, {"role": "assistant", "content": "You're quite welcome, though gratitude is hardly necessary when one is as magnanimous as myself. I'm curious about how you Americans have organized this little rebellion of yours into some semblance of government. What exactly are the primary components of your system? Surely you haven't just handed power to the unwashed masses directly?"}, {"role": "user", "content": "what about the roles of branches "}, {"role": "assistant", "content": "Ah! So you do have some structure to this colonial experiment! Branches, you say? How quaint, like a peculiar little tree of governance. Pray tell, how many of these \\"branches\\" exist in your American system, and what purpose do they supposedly serve? I find it hard to believe they function as effectively as our Parliament."}, {"role": "user", "content": "how many of these branches"}, {"role": "assistant", "content": "*(peers down nose condescendingly)*\\n\\nOne would think you colonials would know your own system! I'm led to understand there is a specific number of these governmental branches you've cobbled together. Three perhaps? Or have you invented some other arrangement? Do enlighten me on this fundamental aspect of your fledgling nation."}]	2025-06-13 05:20:53.035	2025-06-13 05:20:53.035
115	2de7bf63-cd4a-4fee-9e10-c7feecc33061	claude-1749795255022	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-06-13 06:14:15.546	2025-06-13 06:14:15.546
116	e2cfe5c0-a802-47bb-8e64-4ee058f0f73d	claude-1749796443799	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-06-13 06:34:05.366	2025-06-13 06:34:05.366
117	8c18117e-5bcf-4151-a105-0ae4f4d2dd68	claude-1749807572204	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-06-13 09:39:32.703	2025-06-13 09:39:32.703
118	8c18117e-5bcf-4151-a105-0ae4f4d2dd68	claude-1749807752906	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}]	2025-06-13 09:42:35.782	2025-06-13 09:42:35.782
119	309d1779-d84a-4111-9f7e-70ccd6ddf587	claude-article-1749836276620	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": " ç∫bccxv"}, {"role": "assistant", "content": "I don't understand what you're trying to ask. Would you like to discuss something about the three branches of government from the article? I'm here to help if you have questions about how Congress, the Presidency, or the courts work together in our system."}]	2025-06-13 17:37:58.469	2025-06-13 17:37:58.469
120	309d1779-d84a-4111-9f7e-70ccd6ddf587	claude-1749836280937	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "ZXCzXcv"}, {"role": "assistant", "content": "*(peers through monocle with heightened scrutiny)*\\n\\nI say, has the colonial education system failed so dramatically already? Perhaps you might try forming actual words? \\n\\nI am inquiring about your American government structure. How many branches does your fledgling system possess?"}]	2025-06-13 17:38:06.764	2025-06-13 17:38:06.764
121	309d1779-d84a-4111-9f7e-70ccd6ddf587	claude-article-1749837877615	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "sdfgssdfg"}, {"role": "assistant", "content": "I notice you've typed some random letters. I'm here to help you understand the article about the three branches of government. Would you like me to explain something specific about how Congress, the Presidency, or the Supreme Court works? Or perhaps you're curious about how they balance power between them?"}]	2025-06-13 18:04:40.39	2025-06-13 18:04:40.39
122	309d1779-d84a-4111-9f7e-70ccd6ddf587	claude-article-1749837886304	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "sdfgssdfg"}, {"role": "assistant", "content": "I notice you've typed some random letters. I'm here to help you understand the article about the three branches of government. Would you like me to explain something specific about how Congress, the Presidency, or the Supreme Court works? Or perhaps you're curious about how they balance power between them?"}, {"role": "user", "content": "Where is the article"}, {"role": "assistant", "content": "The article is displayed on the left side of your screen. It's titled \\"The Three Branches of Government: How the Pieces Fit Together\\" and covers why the government was split into branches, plus details about Congress, the President, and the Courts. Let me know if you'd like to discuss any part of it!"}]	2025-06-13 18:04:49.52	2025-06-13 18:04:49.52
123	309d1779-d84a-4111-9f7e-70ccd6ddf587	claude-1749837893458	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "WHat up"}, {"role": "assistant", "content": "I beg your pardon? Is that how the youth of the colonies address their betters these days? Most uncivilized. \\n\\nPerhaps you might enlighten me on how your government functions? I'm particularly curious about its basic structure, though I doubt it compares to our refined British system."}]	2025-06-13 18:04:58.205	2025-06-13 18:04:58.205
124	309d1779-d84a-4111-9f7e-70ccd6ddf587	claude-article-1749838024342	article	[{"role": "assistant", "content": "Hi! We are reading about the three branches of government. Hit me up if you want to chat about the article or if you have any questions."}, {"role": "user", "content": "sdfgssdfg"}, {"role": "assistant", "content": "I notice you've typed some random letters. I'm here to help you understand the article about the three branches of government. Would you like me to explain something specific about how Congress, the Presidency, or the Supreme Court works? Or perhaps you're curious about how they balance power between them?"}, {"role": "user", "content": "Where is the article"}, {"role": "assistant", "content": "The article is displayed on the left side of your screen. It's titled \\"The Three Branches of Government: How the Pieces Fit Together\\" and covers why the government was split into branches, plus details about Congress, the President, and the Courts. Let me know if you'd like to discuss any part of it!"}, {"role": "user", "content": "asdf"}, {"role": "assistant", "content": "I see you're still typing random keys. The article about the three branches of government is on your screen to read. If you have actual questions about how the U.S. government works or need help understanding the content, I'm happy to assist you. Otherwise, I'm here specifically to discuss this topic when you're ready."}]	2025-06-13 18:07:06.824	2025-06-13 18:07:06.824
125	309d1779-d84a-4111-9f7e-70ccd6ddf587	claude-1749837893458	assessment	[{"role": "assistant", "content": "Greetings, young colonial subjects! I am Reginald Worthington III, sent by His Majesty's service to study your peculiar experiment in self-governance.\\nI have graciously agreed to examine this quaint little system you call \\"democracy\\" before its inevitable collapse. How amusing!\\nPerhaps you would be willing to enlighten me about your government's structure? I shall endeavor to maintain a modicum of interest in your explanations, despite their obvious inferiority to our glorious British monarchy.\\n*(adjusts cravat with practiced flourish)*"}, {"role": "user", "content": "WHat up"}, {"role": "assistant", "content": "I beg your pardon? Is that how the youth of the colonies address their betters these days? Most uncivilized. \\n\\nPerhaps you might enlighten me on how your government functions? I'm particularly curious about its basic structure, though I doubt it compares to our refined British system."}]	2025-06-13 18:07:09.889	2025-06-13 18:07:09.889
\.


--
-- Data for Name: feedbacks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.feedbacks (id, session_id, summary, content_knowledge_score, writing_score, next_steps, created_at) FROM stdin;
1	ee3084e9-694a-4ec8-a6f7-e048d5e78361	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-12 22:26:13.465
2	b143025f-508f-4f4f-8b2c-c40c5f1e211b	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-13 13:35:39.975
3	b143025f-508f-4f4f-8b2c-c40c5f1e211b	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-13 14:06:08.849
4	b143025f-508f-4f4f-8b2c-c40c5f1e211b	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-13 14:14:28.602
5	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-13 17:15:11.578
6	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-13 17:33:27.53
7	b07e881f-1f7a-4749-ab41-b05b0f1b513e	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-14 13:11:02.869
8	b07e881f-1f7a-4749-ab41-b05b0f1b513e	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-14 14:09:25.384
9	910ca260-6d5d-45e9-b8e0-f70d39cc330c	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-14 23:32:13.399
10	ee3084e9-694a-4ec8-a6f7-e048d5e78361	The student has provided a clear and accurate description of the three branches of the U.S. government, their functions, composition, and key actions. However, they have not yet engaged with the specific case of United States v. Nixon or discussed how the Executive Branch exercised its power in that situation.	3	3	To deepen your understanding, focus on analyzing the United States v. Nixon case. Consider how President Nixon exercised his executive powers and the constitutional authority he claimed. This will help you apply your foundational knowledge to real-world scenarios and understand the practical implications of the separation of powers.	2025-05-15 00:35:51.557
11	ee3084e9-694a-4ec8-a6f7-e048d5e78361	The student provided a detailed explanation of the U.S. government's structure, including the functions, composition, and key actions of each branch. However, in the teaching conversation, the student did not engage with the specific question about Nixon's motivation, instead commenting on the teacher's intelligence.	3	3	Focus on engaging more deeply with specific questions and scenarios, such as analyzing motivations and implications in historical cases like United States v. Nixon. This will help enhance critical thinking and application of knowledge.	2025-05-15 00:36:41.231
12	f0495525-6179-4eb8-ad01-01b3fde8562d	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-15 01:41:47.085
13	b07e881f-1f7a-4749-ab41-b05b0f1b513e	The student greets the teacher politely and inquires about their well-being, showing good manners. The student is open to engaging in a learning activity about the branches of government.	2	3	The student should continue engaging with the activities and ask questions to deepen their understanding of the branches of government. Exploring real-life examples or case studies could also enhance comprehension and retention.	2025-05-15 13:14:30.108
14	b07e881f-1f7a-4749-ab41-b05b0f1b513e	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-16 04:37:48.704
15	b07e881f-1f7a-4749-ab41-b05b0f1b513e	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-16 04:42:42.333
16	b07e881f-1f7a-4749-ab41-b05b0f1b513e	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-16 04:45:22.607
17	afb3252f-7dff-41b3-a7b9-625a4e5e32b9	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-16 13:33:28.515
18	b3d0e363-224a-4a36-a55d-e5820f5f6759	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-20 20:17:46.839
19	b3d0e363-224a-4a36-a55d-e5820f5f6759	The student is actively participating in the activity by selecting the 'Restaurant' metaphor and engaging with the task of matching the roles to the branches of government.	2	2	Encourage the student to complete the metaphor activity by matching the roles to the branches of government. This will help solidify their understanding of how each branch functions and relates to real-world scenarios.	2025-05-20 22:54:28.308
20	a89e9dde-40a5-4304-8e38-e5d67a406b18	The student correctly identified analogies between roles in movie production and branches of government, demonstrating an understanding of the legislative, executive, and judicial branches.	3	2	Continue exploring other categories to strengthen understanding of the branches of government. Consider elaborating on the reasoning behind these analogies to deepen comprehension.	2025-05-21 20:39:37.414
21	a89e9dde-40a5-4304-8e38-e5d67a406b18	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-22 04:02:55.331
22	4a7e3153-5e01-4393-9377-a47f52d636de	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-23 16:26:55.594
23	4a7e3153-5e01-4393-9377-a47f52d636de	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-23 16:50:29.144
24	68da75df-7b5e-42d8-96d8-8f3b699f6aa0	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-27 17:18:07.009
25	a8e4d16a-2f26-459c-871a-490929d94eae	The student shows a basic engagement with the activity by choosing a metaphor to explore the branches of government. However, there is minimal elaboration or analysis of the government structure or the metaphor itself.	1	1	Encourage the student to elaborate on how the metaphor of a school play can represent the three branches of government, detailing the roles and responsibilities similar to the executive, legislative, and judicial branches.	2025-05-28 14:38:14.15
26	02030b16-1eef-4d4a-b3cd-d90b5b02663c	The student chose to use car parts as metaphors for branches of government but did not make any matches, leaving the task incomplete.	1	1	Encourage the student to engage more deeply with the activity by attempting to match car parts with government branches. This will help solidify their understanding of each branch's role.	2025-05-28 20:06:56.701
27	2dc8e31f-c2b6-401e-b5c3-5a25714601b5	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-05-30 17:40:14.359
28	d6040082-c14e-477b-b557-17dcd097df59	The student demonstrated an understanding of the U.S. government's structure and its functionality in practice, particularly in the United States v. Nixon case. They recognized the system's effectiveness and its imperfections, noting Nixon's resignation as a pragmatic move to avoid further national strife. The student considered the balance between justice and the pragmatic use of resources, acknowledged the media's role as an unofficial check on presidential power, and commented on the evolution of media's impact on transparency and skepticism. Overall, the student showed critical thinking and engagement with the topic.	4	3	To deepen your understanding, explore further how the balance of power among the branches has evolved in recent administrations. Consider how modern challenges, like digital information and global issues, might affect the balance of powers and checks in the U.S. government.	2025-06-01 16:38:20.828
29	ffe12cc1-4437-4cce-9582-6dc49c6fa7cd	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-06-02 20:07:35.486
30	a0e7786d-f37c-4878-8e95-142dd7db5df0	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-06-03 20:10:06.888
31	e1e679b8-a9ea-444f-ac78-e9086a2fa9a6	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-06-13 05:25:32.867
32	2de7bf63-cd4a-4fee-9e10-c7feecc33061	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-06-13 06:14:21.626
33	8c18117e-5bcf-4151-a105-0ae4f4d2dd68	Insufficient student input for evaluation.	0	0	Please engage with the activities so we can give you helpful feedback!	2025-06-13 09:42:43.17
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (id, user_id, session_id, created_at, expires_at) FROM stdin;
1	1	dcdcfebe-f86e-41a6-aac0-1d537357b6c6	2025-05-10 03:04:39.136	2025-05-17 03:04:39.136
2	2	b143025f-508f-4f4f-8b2c-c40c5f1e211b	2025-05-10 03:07:56.922	2025-05-17 03:07:56.922
3	3	90943449-bfa8-4887-8f05-b8c3b6b0c451	2025-05-10 03:08:50.333	2025-05-17 03:08:50.333
4	4	9786822e-4da5-4969-b50f-d5bc63fca925	2025-05-11 01:15:32.753	2025-05-18 01:15:32.753
5	5	b05a9b8e-3f69-4720-8efb-d1e4f896c087	2025-05-12 14:10:54.207	2025-05-19 14:10:54.207
6	6	97ce511d-e80e-4bd4-9ade-64b07e08f0e6	2025-05-12 18:02:44.158	2025-05-19 18:02:44.158
7	7	a22a4efc-e0be-4a9c-8ad6-781d4ffb81f9	2025-05-12 21:52:44.327	2025-05-19 21:52:44.327
8	8	ee302ddd-d3e3-4ecf-a6e8-ba664977fa58	2025-05-12 21:56:00.514	2025-05-19 21:56:00.514
9	9	ee3084e9-694a-4ec8-a6f7-e048d5e78361	2025-05-12 22:10:53.243	2025-05-19 22:10:53.243
10	10	fa23fc8e-3a35-4087-a4e4-8fa42151991f	2025-05-12 22:22:48.875	2025-05-19 22:22:48.875
11	11	13fad15c-7693-44a9-a2e9-4e2d911aa16d	2025-05-12 22:53:55.738	2025-05-19 22:53:55.738
12	12	c63bf61c-ef56-4bb5-8f40-21ac8ca03009	2025-05-12 23:36:30.349	2025-05-19 23:36:30.349
13	13	345047c3-1760-46bf-ab3f-5781446138c8	2025-05-13 00:06:06.82	2025-05-20 00:06:06.82
14	14	9ea08a09-c6d5-4393-803f-787f37667d68	2025-05-13 01:31:24.517	2025-05-20 01:31:24.517
15	15	5b9eaa58-26f2-4043-b88b-4a9d9fe93dcf	2025-05-13 02:01:17.235	2025-05-20 02:01:17.235
16	16	a598ea12-86c4-4412-b608-7e2b549af70d	2025-05-13 03:24:27.26	2025-05-20 03:24:27.26
17	17	50187481-dfdc-4115-bcbe-23efbf467d57	2025-05-13 03:50:35.002	2025-05-20 03:50:35.002
18	18	16de2164-fd4a-40cc-9de1-dd2a27675fef	2025-05-13 04:33:38.44	2025-05-20 04:33:38.44
19	19	61fadd2f-041f-4d05-a2ab-867a1fb30369	2025-05-13 06:47:10.623	2025-05-20 06:47:10.622
20	20	dd916d74-b9f7-4682-8886-76dfd26781dd	2025-05-13 07:51:13.827	2025-05-20 07:51:13.827
21	21	f09203c1-8426-4712-be43-8a8ff02aee24	2025-05-13 09:43:41.709	2025-05-20 09:43:41.709
22	22	672d263e-6a87-45ab-bd4b-d8edd3953cb9	2025-05-13 13:33:46.863	2025-05-20 13:33:46.863
23	23	913604bc-1bff-4de5-a317-90b6866ad30f	2025-05-13 14:03:40.787	2025-05-20 14:03:40.787
24	24	a2fc79f2-b7e8-40d3-aabc-a9957320f3ca	2025-05-13 14:24:36.814	2025-05-20 14:24:36.814
25	25	1be285bc-3c77-422b-9f36-2afcafca5b83	2025-05-13 14:42:22.011	2025-05-20 14:42:22.011
26	26	7185461d-a937-456a-b381-939f51e95da0	2025-05-13 15:35:38.586	2025-05-20 15:35:38.586
27	27	4deab85c-70b9-4c1e-812e-1068968d6026	2025-05-13 16:33:43.454	2025-05-20 16:33:43.454
28	28	cf8a736f-0529-4b97-8d98-1b780de348e4	2025-05-13 17:36:07.973	2025-05-20 17:36:07.973
29	29	63767d36-8e5a-4fd2-a741-5d3082191e66	2025-05-13 18:20:18.189	2025-05-20 18:20:18.188
30	30	20771d29-67af-439e-8ec4-52147e4eda79	2025-05-13 18:54:25.736	2025-05-20 18:54:25.736
31	31	78a5aa4e-dcf5-40e4-b368-27bf73c73f34	2025-05-13 18:56:55.794	2025-05-20 18:56:55.794
32	32	13da00ed-f557-4307-83ff-19c266112df2	2025-05-13 18:56:55.799	2025-05-20 18:56:55.799
33	38	b84b5666-b55e-488c-b37c-59686f3d4982	2025-05-13 19:05:24.13	2025-05-20 19:05:24.13
34	39	ea98a7d2-1d77-4bc2-95f2-50ed61586a86	2025-05-13 19:05:26.788	2025-05-20 19:05:26.788
35	40	90f1ecaa-3f82-468c-a88b-97e0ef1c3885	2025-05-13 19:36:17.097	2025-05-20 19:36:17.097
36	41	bc626131-1110-404b-9b99-25a25f6f3d8e	2025-05-13 20:30:17.153	2025-05-20 20:30:17.153
37	42	5b405573-6966-4c51-96e7-ee74943da424	2025-05-13 20:50:41.465	2025-05-20 20:50:41.465
38	43	27e42c89-60fc-4959-a8cd-25cd663c58f5	2025-05-13 20:51:16.874	2025-05-20 20:51:16.874
39	44	649c2a90-d64f-4230-88ba-02210ce94f72	2025-05-13 20:59:53.967	2025-05-20 20:59:53.967
40	45	0f5d0ac3-8659-4ce0-9426-3b122e7e1fd0	2025-05-13 21:00:17.197	2025-05-20 21:00:17.197
41	46	8002bbef-0050-4aed-a5f6-c157008af8b5	2025-05-13 21:01:24.456	2025-05-20 21:01:24.456
42	47	a74fa0ba-7973-4a12-92dd-e4c73b89727b	2025-05-13 21:01:28.503	2025-05-20 21:01:28.503
43	48	1603c905-a105-4036-a972-94e8be254a7b	2025-05-13 21:01:33.965	2025-05-20 21:01:33.965
44	49	aebc35d1-f523-4123-a9b3-8e1c63fc39a0	2025-05-13 21:13:12.72	2025-05-20 21:13:12.72
45	50	720fe393-3471-4349-a4d8-bf0e74574217	2025-05-13 22:50:48.262	2025-05-20 22:50:48.262
46	51	0ff33e40-8d02-452b-a20e-4e24b694b604	2025-05-13 22:50:48.951	2025-05-20 22:50:48.951
47	52	a19d0205-7eba-4498-986c-414a15335fea	2025-05-13 22:50:49.921	2025-05-20 22:50:49.921
48	53	1b3f6812-d410-4233-aae6-0ebaa3cd1f49	2025-05-13 22:50:49.946	2025-05-20 22:50:49.946
49	54	b084b14b-90c5-45a0-8bcf-897946dffa58	2025-05-13 22:50:49.962	2025-05-20 22:50:49.962
50	55	5cc7d1ed-c77d-4018-9f0d-ff469ce0a156	2025-05-13 22:50:50.023	2025-05-20 22:50:50.023
51	56	30f1993d-f520-4a2b-b0d4-900622ab7c60	2025-05-13 22:50:51.37	2025-05-20 22:50:51.37
52	57	d0d2a6fe-0cb4-40ea-a568-8f6690f25446	2025-05-13 22:50:51.369	2025-05-20 22:50:51.369
53	58	acd59fea-7c27-4bee-a2dd-73ec688c49d4	2025-05-13 22:50:51.461	2025-05-20 22:50:51.461
54	59	a3bce6a9-799d-4a58-8a2b-d586cf5c0ff7	2025-05-13 22:50:51.653	2025-05-20 22:50:51.653
55	60	40bb76e1-4a29-415c-a0a8-4f8c621dc92e	2025-05-13 22:50:51.66	2025-05-20 22:50:51.66
56	61	e57d57c0-ce0c-4ae9-a1b7-fd8166b7ab1a	2025-05-13 22:50:51.664	2025-05-20 22:50:51.664
57	62	e0b95589-064b-4233-81bc-65304c8787b2	2025-05-13 22:50:51.696	2025-05-20 22:50:51.696
58	63	0f0d26b8-190e-47c5-bcba-887416550de7	2025-05-13 22:50:51.819	2025-05-20 22:50:51.819
59	64	ff9d8e73-0394-4df9-83b9-425344b74a59	2025-05-13 22:50:51.822	2025-05-20 22:50:51.822
60	65	3974f336-056a-4aba-ae98-2f9994fee08c	2025-05-13 22:50:51.829	2025-05-20 22:50:51.829
61	66	9b39599c-03ac-4e9c-a6c6-2788bbdcb64a	2025-05-13 22:50:51.841	2025-05-20 22:50:51.841
62	67	d4894e54-a24c-48b6-8088-883bd951b857	2025-05-13 22:50:51.921	2025-05-20 22:50:51.921
63	68	6797dfaf-2f9e-4744-a09a-ceda89c0254d	2025-05-13 22:50:51.949	2025-05-20 22:50:51.949
64	69	1f560e3d-3a85-4d29-a038-0f0d1a02dbdd	2025-05-13 22:50:51.962	2025-05-20 22:50:51.962
65	70	d8f27d55-98d6-4e62-9839-232b25b732ef	2025-05-13 22:50:51.978	2025-05-20 22:50:51.978
66	71	ddfa567e-fc0a-4235-9b31-4eabacaf43cb	2025-05-13 22:50:52.1	2025-05-20 22:50:52.1
67	72	19309e97-b9cb-4ab4-bdd0-15d64174e61e	2025-05-13 22:50:52.142	2025-05-20 22:50:52.142
68	73	406d375d-998e-4e24-af85-31893bd27a73	2025-05-13 22:50:52.207	2025-05-20 22:50:52.207
69	74	f2b178bd-9600-482c-8868-7714ea349dbb	2025-05-13 22:50:52.266	2025-05-20 22:50:52.266
70	75	1ae6a4f0-cc7a-4044-9fc5-10d4efe24a9a	2025-05-13 22:50:52.3	2025-05-20 22:50:52.3
71	76	c0f823cf-44ce-44af-92b6-4a35706f34dd	2025-05-13 22:50:52.334	2025-05-20 22:50:52.334
72	77	2dfe28ef-ec0b-4c0c-b6fc-bac9d54491f8	2025-05-13 22:50:52.349	2025-05-20 22:50:52.349
73	78	92338116-eb54-443d-bfa7-879f0c9805c3	2025-05-13 22:50:52.366	2025-05-20 22:50:52.366
74	79	d18fc112-399c-4ab5-80c5-adc390d1866b	2025-05-13 22:50:52.377	2025-05-20 22:50:52.377
75	80	dcfae91e-b6f8-4db7-8aa6-a5093016528a	2025-05-13 22:50:52.453	2025-05-20 22:50:52.453
76	81	8134af75-49f4-4e96-aeaf-0c02e93d43d3	2025-05-13 22:50:52.516	2025-05-20 22:50:52.516
77	82	fd2c04ca-f861-433a-9710-ae6ff114b548	2025-05-13 22:50:52.59	2025-05-20 22:50:52.59
78	83	6d8d53ae-7df6-476e-aa33-b2cae293ec4d	2025-05-13 22:50:52.629	2025-05-20 22:50:52.629
79	84	d681521c-9b08-4f1d-9773-bd38011903dc	2025-05-13 22:50:52.687	2025-05-20 22:50:52.687
80	85	4d87af95-1e88-4d6c-ab12-ff1bcd7d625a	2025-05-13 22:50:52.748	2025-05-20 22:50:52.748
81	86	1fd0f1a7-33d0-49f7-ae95-9c29927d9174	2025-05-13 22:50:52.901	2025-05-20 22:50:52.901
82	87	7fbf129c-ae08-4274-bf89-dc64d5f8a1a7	2025-05-13 22:50:52.976	2025-05-20 22:50:52.976
83	88	b2382d09-404e-4533-a771-1b6ed5c54fa8	2025-05-13 22:50:52.988	2025-05-20 22:50:52.988
84	89	a991e064-4c54-491a-990f-bb3268dc58fe	2025-05-13 22:50:52.996	2025-05-20 22:50:52.996
85	90	2f845d2d-392b-4f4b-a9c8-d92fae157b7b	2025-05-13 22:50:53.038	2025-05-20 22:50:53.038
86	92	998ded80-676a-47f4-9b84-ffed1117a046	2025-05-13 22:50:53.098	2025-05-20 22:50:53.098
87	91	de142e62-de9e-4240-8bf9-c62873b69332	2025-05-13 22:50:53.099	2025-05-20 22:50:53.099
88	93	ff81fea5-eb24-4537-bdca-2d96fa50020f	2025-05-13 22:50:53.109	2025-05-20 22:50:53.109
89	94	7407cdda-ba92-4b46-b81d-3da6bfa00aff	2025-05-13 22:50:53.152	2025-05-20 22:50:53.152
95	100	986af2b1-14bb-40c8-8655-82c60e3a4482	2025-05-13 22:50:53.404	2025-05-20 22:50:53.404
105	110	9ce53a0b-bf1f-4740-b45c-91b68fc9a01c	2025-05-13 22:50:53.68	2025-05-20 22:50:53.68
110	115	79d87a12-f278-4af5-bf14-aa2bb41a443e	2025-05-13 22:50:53.915	2025-05-20 22:50:53.915
111	116	9055cd35-55df-40c7-ad9d-4516799a82ff	2025-05-13 22:50:53.999	2025-05-20 22:50:53.999
113	118	9529435c-1dd7-49e6-96ca-f2228db4e428	2025-05-13 22:50:54.084	2025-05-20 22:50:54.084
114	119	0655848a-782f-4f74-ba7e-102ace4fecb6	2025-05-13 22:50:54.137	2025-05-20 22:50:54.137
90	96	10808a14-bd86-414e-a286-cf12773fcbe2	2025-05-13 22:50:53.196	2025-05-20 22:50:53.196
91	95	66db53a2-f2cb-4571-9c58-6f965976d0a2	2025-05-13 22:50:53.197	2025-05-20 22:50:53.197
107	112	bdedff8c-9b28-4bdc-ab10-1e1fbd20f8f9	2025-05-13 22:50:53.791	2025-05-20 22:50:53.791
116	122	6485b69d-f6c7-4e8b-8d5b-c78e6039ead6	2025-05-13 22:50:54.171	2025-05-20 22:50:54.171
119	124	7c750e17-941a-4c61-bbe4-09e20f5b7ea8	2025-05-13 22:50:54.276	2025-05-20 22:50:54.276
92	97	d620df0c-9f81-4392-a263-eb538c781a3b	2025-05-13 22:50:53.217	2025-05-20 22:50:53.217
101	106	4a225a32-a005-4270-ae17-148b49186d51	2025-05-13 22:50:53.537	2025-05-20 22:50:53.537
103	108	8fc7a222-10c9-43c3-bccf-ed89f5ebd7fa	2025-05-13 22:50:53.625	2025-05-20 22:50:53.625
106	111	cdd81352-3660-4d86-8bc9-ac2aeff80051	2025-05-13 22:50:53.763	2025-05-20 22:50:53.763
112	117	a2713b85-16be-458a-8b72-0d68483d0f13	2025-05-13 22:50:54.014	2025-05-20 22:50:54.014
115	120	30024588-adcc-425d-a0b4-cc4cafb1bc60	2025-05-13 22:50:54.168	2025-05-20 22:50:54.168
121	126	c9037cfb-682b-40b1-9740-8b86d9b07006	2025-05-13 22:50:54.308	2025-05-20 22:50:54.308
122	127	8752b5c6-f84c-461e-a5b4-1e72dc63bcec	2025-05-13 22:50:54.357	2025-05-20 22:50:54.357
123	128	1f08f0eb-ef59-4ace-b1f9-d1666874b4ac	2025-05-13 22:50:54.469	2025-05-20 22:50:54.469
93	98	46301411-931a-493f-9277-644e96bbcd61	2025-05-13 22:50:53.283	2025-05-20 22:50:53.283
94	99	4ebc3745-4e1a-4e66-af0e-99ef459ea51f	2025-05-13 22:50:53.378	2025-05-20 22:50:53.378
99	104	dd04fad8-38c3-4a0e-abd7-558c3a83c395	2025-05-13 22:50:53.499	2025-05-20 22:50:53.499
102	107	3ad81541-7438-4bb2-8c97-11e2c514c8ee	2025-05-13 22:50:53.587	2025-05-20 22:50:53.587
104	109	36a2de83-590a-40a9-a427-5c3392e5b147	2025-05-13 22:50:53.659	2025-05-20 22:50:53.659
96	101	f119c66a-167e-479a-b4bf-b3e8468ccf66	2025-05-13 22:50:53.419	2025-05-20 22:50:53.419
97	102	0d74f448-c4f3-4e36-9d15-bf7f6fe73316	2025-05-13 22:50:53.47	2025-05-20 22:50:53.47
98	103	7c93f894-6406-4d3e-a7c3-d632fcb4f86d	2025-05-13 22:50:53.471	2025-05-20 22:50:53.471
100	105	c2b3bc08-2040-4c4c-9904-1cf078d73fba	2025-05-13 22:50:53.527	2025-05-20 22:50:53.527
108	113	10a2660b-489a-4275-99d8-d78cc46b1d6b	2025-05-13 22:50:53.825	2025-05-20 22:50:53.825
109	114	8d7c56fa-3982-4186-b5a0-3e95e4321c66	2025-05-13 22:50:53.871	2025-05-20 22:50:53.871
117	121	15c01d7c-e4b0-4184-8220-63c4dfb55139	2025-05-13 22:50:54.171	2025-05-20 22:50:54.171
118	123	f2b30c25-bf8a-4629-a96c-77b6503344da	2025-05-13 22:50:54.244	2025-05-20 22:50:54.244
120	125	fb6a1fc2-9163-4680-b11a-773582e716da	2025-05-13 22:50:54.287	2025-05-20 22:50:54.287
124	129	f178799a-ab05-4c5f-a111-662689feac05	2025-05-13 22:50:54.489	2025-05-20 22:50:54.489
125	130	59269d34-7838-4a35-a0f5-2f643af3c643	2025-05-13 22:50:54.709	2025-05-20 22:50:54.709
126	131	7bab0382-d0a2-43b4-831f-1b4aecac8827	2025-05-13 22:50:54.831	2025-05-20 22:50:54.831
127	132	1671b0aa-543f-4f99-9450-d23a4268995b	2025-05-13 23:05:35.046	2025-05-20 23:05:35.046
128	133	59fa58cc-2130-4ac7-b631-7fe799be71ae	2025-05-13 23:36:34.871	2025-05-20 23:36:34.871
129	134	546ab93a-4c2b-4dc1-a5cd-2c2e90525844	2025-05-14 00:33:34.255	2025-05-21 00:33:34.255
130	135	71f9d7c5-8a33-4ac8-a7fb-d8725559dba8	2025-05-14 00:50:23.218	2025-05-21 00:50:23.218
131	136	355187ec-de04-4c28-9d4a-4f8ccf6c6d85	2025-05-14 02:21:32.761	2025-05-21 02:21:32.761
132	137	37556227-af3e-409f-b192-82a7ffb86069	2025-05-14 02:58:37.414	2025-05-21 02:58:37.413
133	138	672036e3-3e63-42d2-a9c3-36219c82cb4a	2025-05-14 03:37:52.844	2025-05-21 03:37:52.844
134	139	1c59a2af-2a52-48d7-87b8-c7cc632d1b3d	2025-05-14 04:16:34.423	2025-05-21 04:16:34.422
135	140	a5813c42-2b5b-4c8d-b5f3-d435cde15b2b	2025-05-14 04:51:11.027	2025-05-21 04:51:11.027
136	141	fa0baa7f-f4c3-4845-a794-6bafe25d86d0	2025-05-14 05:40:47.529	2025-05-21 05:40:47.529
137	142	41c53e58-37bb-4b5b-aad3-f95035b231ab	2025-05-14 06:51:12.242	2025-05-21 06:51:12.242
138	143	2acea87d-1967-42a4-ab48-5238242866ba	2025-05-14 06:55:40.352	2025-05-21 06:55:40.352
139	144	d6b44960-b5ed-4444-b19d-4d98e7d17a5a	2025-05-14 07:16:30.29	2025-05-21 07:16:30.29
140	145	5e5d336c-a5ee-4ddf-bf9b-b6552dda6586	2025-05-14 09:20:33.854	2025-05-21 09:20:33.854
141	146	4aed7882-5563-41e0-9412-8a2ba18a8893	2025-05-14 10:18:31.024	2025-05-21 10:18:31.024
142	147	fa559dbe-0966-43e0-9f2e-ccc37ce9c9b6	2025-05-14 11:06:27.277	2025-05-21 11:06:27.277
143	148	ccd5b3b8-0f56-44df-a6b6-21eddff52682	2025-05-14 12:09:37.177	2025-05-21 12:09:37.177
144	149	2ff125cc-5320-4f4d-82dd-b45c12ae0030	2025-05-14 12:33:41.196	2025-05-21 12:33:41.196
145	150	b07e881f-1f7a-4749-ab41-b05b0f1b513e	2025-05-14 13:02:32.285	2025-05-21 13:02:32.285
146	151	6797ee84-6e9c-490e-8936-896f269db9f3	2025-05-14 13:05:21.523	2025-05-21 13:05:21.523
147	152	55c9dde5-c1bd-403a-84d3-ce6450479dfa	2025-05-14 13:06:33.586	2025-05-21 13:06:33.586
148	153	f99a6fca-d702-4ef5-bf6c-d9c577183c51	2025-05-14 13:13:03.674	2025-05-21 13:13:03.674
149	154	4539fd2c-761b-4651-948b-246f495bf79d	2025-05-14 13:23:35.924	2025-05-21 13:23:35.924
150	155	2f6f5510-f503-47d7-a6f2-962ea30424c2	2025-05-14 14:08:23.605	2025-05-21 14:08:23.605
151	156	f67e5cd1-f453-4dcb-a1d8-247e2eb7f559	2025-05-14 14:27:24.654	2025-05-21 14:27:24.654
152	157	f6d44a5c-36c0-4aac-b28d-7a381a28bdbe	2025-05-14 15:08:15.876	2025-05-21 15:08:15.876
153	158	706c47c3-14c2-4d49-b496-6b864273cbda	2025-05-14 15:38:29.813	2025-05-21 15:38:29.813
154	159	48e5cb6c-5430-48eb-9eb6-324804b38116	2025-05-14 15:58:24.167	2025-05-21 15:58:24.167
155	160	b0e6a37c-3c57-4f1b-a064-8cca0ced646a	2025-05-14 16:14:42.122	2025-05-21 16:14:42.122
156	161	01ce6fea-3b1d-4ca0-93eb-895c45a062a5	2025-05-14 16:54:12.99	2025-05-21 16:54:12.99
157	162	0aab35b6-904a-4ab2-9056-e19d97a19027	2025-05-14 17:14:41.736	2025-05-21 17:14:41.736
158	163	5397f0e9-e6c6-447c-ba9d-e3c5b02e7a60	2025-05-14 17:36:06.285	2025-05-21 17:36:06.285
159	164	891567fa-992b-4775-bab8-315f9f5dd25c	2025-05-14 18:04:14.552	2025-05-21 18:04:14.552
160	165	e9a9ae30-938a-4963-80ad-45a957e3feaa	2025-05-14 18:26:31.475	2025-05-21 18:26:31.475
161	166	16d1679f-95b6-45a7-9ee2-15a83a5a75eb	2025-05-14 18:31:04.788	2025-05-21 18:31:04.788
162	167	5c077064-2340-4d26-827c-4c4a6c36d60c	2025-05-14 19:18:16.818	2025-05-21 19:18:16.818
163	168	27891a8f-9095-4406-9bfa-ed72d3a15376	2025-05-14 19:32:38.08	2025-05-21 19:32:38.08
164	169	5b886e42-99b5-43a1-8ea7-5b46d7b24fe3	2025-05-14 20:50:34.953	2025-05-21 20:50:34.952
165	170	39c87e9f-8d8a-402d-bcf0-b916566a5e0e	2025-05-14 21:06:19.853	2025-05-21 21:06:19.853
166	171	f1c5850d-64a5-47dc-b429-b2da9df0f0f3	2025-05-14 21:24:54.549	2025-05-21 21:24:54.549
167	172	b69f181d-7a59-4609-8387-fa417c77a346	2025-05-14 22:39:17.445	2025-05-21 22:39:17.445
168	173	ba355075-2536-4365-b4b4-b5b3c13364b8	2025-05-14 23:11:08.853	2025-05-21 23:11:08.853
172	175	5e48e58b-968e-4bd3-8831-db87965e5322	2025-05-14 23:19:24.665	2025-05-21 23:19:24.665
169	174	a8c14da8-610f-4330-8b94-a0e634c6a924	2025-05-14 23:19:24.666	2025-05-21 23:19:24.666
171	177	36259cf9-42e2-4ee7-b54e-a79eeba95d4f	2025-05-14 23:19:24.665	2025-05-21 23:19:24.665
170	176	41fc97b1-939e-46dd-8e07-1c2e7b84ba0a	2025-05-14 23:19:24.664	2025-05-21 23:19:24.664
173	179	a4305b3f-3c3e-4a78-8d1e-92df31492657	2025-05-14 23:19:24.7	2025-05-21 23:19:24.7
174	178	a4bec0b8-dbc5-4b76-938e-7539d1281b8a	2025-05-14 23:19:24.701	2025-05-21 23:19:24.701
175	180	0a53e05d-ff91-49b5-ac49-56fcda7bb4d7	2025-05-14 23:19:24.755	2025-05-21 23:19:24.755
176	181	f35efbf2-15ef-4aa8-b1b1-275ecb7e0575	2025-05-14 23:19:24.776	2025-05-21 23:19:24.776
177	184	5d907be2-0457-4163-aa0c-3be8532b3f3d	2025-05-14 23:20:04.324	2025-05-21 23:20:04.324
178	182	aad04aee-84dd-463b-8b1d-e804d0e7fb4e	2025-05-14 23:20:04.323	2025-05-21 23:20:04.323
179	183	6d527f64-f33d-41b8-9863-ff5e1a72850a	2025-05-14 23:20:04.325	2025-05-21 23:20:04.325
180	185	336a857f-597a-4b67-b27d-6cf2f55df70b	2025-05-14 23:20:04.325	2025-05-21 23:20:04.325
181	186	910ca260-6d5d-45e9-b8e0-f70d39cc330c	2025-05-14 23:20:45.121	2025-05-21 23:20:45.121
182	187	555ae915-4ade-4ebd-864b-ffcb2c1ac4b9	2025-05-14 23:20:49.796	2025-05-21 23:20:49.796
183	188	17f79fd7-65e2-4fb5-87ef-8b667f3b1974	2025-05-14 23:25:00.9	2025-05-21 23:25:00.9
184	189	60b87d51-dea8-4993-9ef8-329c76908ff6	2025-05-15 00:06:05.281	2025-05-22 00:06:05.281
185	190	157eb4bb-ce43-42ff-8f53-28acf50e492a	2025-05-15 00:40:34.554	2025-05-22 00:40:34.553
186	191	8557312b-e9e3-4b31-89a8-1d6a0f7ff7c4	2025-05-15 00:42:28.926	2025-05-22 00:42:28.926
187	192	05da3ff5-ba5b-421e-9415-87b1f0671a00	2025-05-15 00:42:28.948	2025-05-22 00:42:28.948
188	193	e295eea3-c797-4739-be3d-42383bae6ae4	2025-05-15 00:42:29.206	2025-05-22 00:42:29.206
189	194	88cc2ccc-204f-45ba-a561-202d287ffd1e	2025-05-15 00:42:29.364	2025-05-22 00:42:29.364
190	195	917c6ce6-76c7-4ef4-8ff7-d395215a33f6	2025-05-15 00:42:32.939	2025-05-22 00:42:32.939
191	196	b4a415b8-58fd-4f8f-804f-eabd21873c93	2025-05-15 00:42:33.321	2025-05-22 00:42:33.321
192	197	22c7037e-ad5b-446d-bc57-5b3906cfc2d8	2025-05-15 00:42:33.327	2025-05-22 00:42:33.327
193	199	0db3ed49-48c5-4e68-8606-291bb60bb759	2025-05-15 00:42:33.346	2025-05-22 00:42:33.346
194	198	df6b8155-980c-413c-a758-7d18d20164bd	2025-05-15 00:42:33.343	2025-05-22 00:42:33.343
195	200	ce7a062a-2370-40f2-8502-a559a40daed1	2025-05-15 00:42:33.439	2025-05-22 00:42:33.439
196	201	9b46a60e-3cef-4afa-97dd-cd5c715552c3	2025-05-15 00:42:33.497	2025-05-22 00:42:33.497
197	202	2be9fabe-98b2-4446-88fe-149b9521927c	2025-05-15 00:42:33.498	2025-05-22 00:42:33.498
198	204	c43c2531-eb37-41c3-9084-22de5cdd7015	2025-05-15 00:42:33.541	2025-05-22 00:42:33.541
199	203	a4fed82b-cb3a-463f-b995-d82e537506bc	2025-05-15 00:42:33.54	2025-05-22 00:42:33.54
200	205	7be4af70-d5d8-440d-a7da-35f48d60e7cb	2025-05-15 00:42:33.549	2025-05-22 00:42:33.549
201	206	bfdb39d7-adf0-4ab6-9a76-70c852a70fdf	2025-05-15 00:42:33.659	2025-05-22 00:42:33.659
202	208	c6893660-af9d-4184-b56e-4bf1e6c694c8	2025-05-15 00:42:33.669	2025-05-22 00:42:33.669
203	207	01d8c502-a979-4ce8-aed7-f0e3af13128d	2025-05-15 00:42:33.669	2025-05-22 00:42:33.669
204	209	f83f96e2-2823-4996-80a9-24603c22a4c7	2025-05-15 00:42:33.674	2025-05-22 00:42:33.674
205	210	c5a7de1a-dd70-4d0f-b41e-9811c5f1739c	2025-05-15 00:42:33.781	2025-05-22 00:42:33.781
207	212	77800476-4fa8-41dd-84ad-9b56470e15e2	2025-05-15 00:42:33.85	2025-05-22 00:42:33.85
212	217	b1d3b02e-a46b-4f80-bfa0-dd95d70958c8	2025-05-15 00:42:34.114	2025-05-22 00:42:34.114
214	219	d753ecf0-6827-46ee-b71c-31584a01d10e	2025-05-15 00:42:34.194	2025-05-22 00:42:34.194
221	226	970cdecf-c510-46f1-a9ec-9925a1824e81	2025-05-15 00:42:34.364	2025-05-22 00:42:34.364
206	211	d365a957-d833-48fa-aac9-789b7044ca2f	2025-05-15 00:42:33.808	2025-05-22 00:42:33.808
208	213	c18090be-95cb-4293-997e-8db2e974a884	2025-05-15 00:42:33.87	2025-05-22 00:42:33.87
209	214	16f79a64-070e-42a6-8cc7-c32cb8defdaa	2025-05-15 00:42:33.921	2025-05-22 00:42:33.921
210	215	0c7fb55f-526d-4b79-beb5-76cd93cba7dc	2025-05-15 00:42:33.989	2025-05-22 00:42:33.989
211	216	02ef1308-4a8d-463b-aff5-c9d4c0df984f	2025-05-15 00:42:34.085	2025-05-22 00:42:34.085
213	218	32e2c605-e51a-4917-a7b6-3efb1b68c8d1	2025-05-15 00:42:34.158	2025-05-22 00:42:34.158
216	220	dbe5746a-0372-46b0-aeeb-e7ee34fd16dd	2025-05-15 00:42:34.227	2025-05-22 00:42:34.227
218	222	9cb5bef6-a106-496c-8e46-08e0c4c76e5b	2025-05-15 00:42:34.29	2025-05-22 00:42:34.29
220	224	711c8e25-2e6e-427d-bb7f-ea7d439df207	2025-05-15 00:42:34.357	2025-05-22 00:42:34.357
215	221	c1f78ab0-41cf-4e2a-abc0-273c3f027a0f	2025-05-15 00:42:34.226	2025-05-22 00:42:34.226
217	223	259092d6-21ec-4c2d-945a-573e138c9c7a	2025-05-15 00:42:34.289	2025-05-22 00:42:34.289
219	225	fdacee77-a949-48ea-93b6-9803b3d2b910	2025-05-15 00:42:34.355	2025-05-22 00:42:34.355
222	227	8a08c38c-b027-40f8-ae81-dcac1c49237a	2025-05-15 00:42:34.364	2025-05-22 00:42:34.364
223	228	167ea789-cfd1-4bfa-be01-f948c0d9558d	2025-05-15 00:44:06.516	2025-05-22 00:44:06.516
224	229	112c12bb-59b0-45ad-b766-9bab591c5ec1	2025-05-15 00:44:10.66	2025-05-22 00:44:10.66
225	230	5622e5f3-62ad-4365-bd83-bb167eea6ca2	2025-05-15 00:44:10.668	2025-05-22 00:44:10.668
226	231	f8d0d588-8010-400b-8b30-cb95b1766762	2025-05-15 00:44:24.561	2025-05-22 00:44:24.561
227	232	358a55af-f635-4f48-ae95-847bc81d82e3	2025-05-15 00:44:25.362	2025-05-22 00:44:25.362
228	233	394fdf56-e443-4b1a-b007-54110ff9af3a	2025-05-15 00:44:28.28	2025-05-22 00:44:28.28
229	234	9c59fbba-aa90-464c-9205-899d07ca51ce	2025-05-15 00:44:28.314	2025-05-22 00:44:28.314
230	236	ee334e3c-c77a-42f9-b94e-638a57f19c30	2025-05-15 00:44:28.515	2025-05-22 00:44:28.515
231	235	22a9637f-ed9f-47cf-90e1-a6779d71f640	2025-05-15 00:44:28.516	2025-05-22 00:44:28.516
232	237	b1187bb3-3ece-463c-af56-149fddb747c1	2025-05-15 00:44:28.634	2025-05-22 00:44:28.634
233	238	59ce5ec8-2667-40e9-9bc3-fd992165f61f	2025-05-15 00:44:28.637	2025-05-22 00:44:28.637
234	239	77ca6097-c02e-4d56-bb13-48674590858e	2025-05-15 00:44:28.642	2025-05-22 00:44:28.642
235	240	b1c56086-557d-4ae8-9906-c8f3d6578662	2025-05-15 00:44:28.645	2025-05-22 00:44:28.645
236	241	0557acba-aef4-46fd-9278-422c00d56ef9	2025-05-15 00:44:28.739	2025-05-22 00:44:28.739
237	242	5427ff26-92d9-43c4-bad7-943cfb179c83	2025-05-15 00:44:28.751	2025-05-22 00:44:28.75
238	243	3d094e0b-1896-47ff-9b20-8e924a92008f	2025-05-15 01:39:36.781	2025-05-22 01:39:36.781
239	244	ecb4d456-2c7e-4426-b0ce-c51ac15ae154	2025-05-15 01:40:45.343	2025-05-22 01:40:45.343
240	245	a636eb3f-0a6a-41bd-bc40-4254a374deae	2025-05-15 01:40:46.614	2025-05-22 01:40:46.614
241	246	a38c606b-5e97-4753-a0a7-75fe52e292ce	2025-05-15 01:40:47.206	2025-05-22 01:40:47.206
242	247	1b45052c-6cc8-4bd2-8ad2-b1b5dad36ebd	2025-05-15 01:40:47.291	2025-05-22 01:40:47.291
243	248	ab24b587-8b55-4581-a250-c53e02e48dc0	2025-05-15 01:40:47.355	2025-05-22 01:40:47.355
244	249	2298710a-e754-4582-aa72-f1e6226d5c57	2025-05-15 01:40:47.358	2025-05-22 01:40:47.358
245	250	65dd7e29-adba-40ee-935c-3e8951595170	2025-05-15 01:40:47.451	2025-05-22 01:40:47.451
246	251	22b24920-faf3-4ae4-8e42-4bfeece125f6	2025-05-15 01:40:47.456	2025-05-22 01:40:47.456
247	252	a96e2190-f07f-4b78-937d-51f32dfe7842	2025-05-15 01:40:47.475	2025-05-22 01:40:47.475
248	253	ed57841f-e2f1-45ac-9cfb-bfaf2911a556	2025-05-15 01:40:47.574	2025-05-22 01:40:47.574
249	254	a662be1a-b992-4e73-ab79-a5f12d969c19	2025-05-15 01:40:47.622	2025-05-22 01:40:47.622
250	255	f8a1223e-ce86-4b55-a259-de43800cc004	2025-05-15 01:40:49.186	2025-05-22 01:40:49.186
251	256	9bd9a38a-6826-4801-a4fb-baa5e84e3e07	2025-05-15 01:40:49.348	2025-05-22 01:40:49.348
252	257	efbb5aa1-ba4a-4e2f-86fb-734a86d789c0	2025-05-15 01:40:49.373	2025-05-22 01:40:49.373
253	258	9ada97f3-b681-4d78-9a50-f35f9b1c6a44	2025-05-15 01:40:49.374	2025-05-22 01:40:49.374
254	260	f214bd75-9776-41c4-9333-02a1e612d7a9	2025-05-15 01:40:49.458	2025-05-22 01:40:49.458
255	259	e47fb12d-b6dc-4687-911f-f24af4a17103	2025-05-15 01:40:49.457	2025-05-22 01:40:49.457
256	262	7b9375b5-6544-457d-ae7c-bf35c976a225	2025-05-15 01:40:49.502	2025-05-22 01:40:49.502
257	261	8ec0eb52-bba9-4be7-b021-5678c6edd694	2025-05-15 01:40:49.497	2025-05-22 01:40:49.497
258	263	56a1888c-ba8f-4f98-a275-5142a8e58a39	2025-05-15 01:40:49.509	2025-05-22 01:40:49.509
259	264	63a7eead-c710-4415-9d2a-a5c7f13cf1db	2025-05-15 01:40:49.544	2025-05-22 01:40:49.544
260	265	21a72a2b-d616-4282-9f5d-9e40ef48d6f9	2025-05-15 01:40:49.549	2025-05-22 01:40:49.549
261	267	088018ef-3e47-46b3-930d-4dd13b5b297b	2025-05-15 01:40:49.607	2025-05-22 01:40:49.607
262	266	d92cb850-8e90-4802-b743-50430abd0a9f	2025-05-15 01:40:49.606	2025-05-22 01:40:49.606
263	268	f3f250f1-ab4b-4b13-b46f-9ae92c45b36d	2025-05-15 01:40:49.628	2025-05-22 01:40:49.628
264	269	9f5e429c-467f-4385-bc50-20096d752440	2025-05-15 01:40:49.632	2025-05-22 01:40:49.632
265	270	43e72eac-fd8f-4d4a-b2d9-53d857c5cdb7	2025-05-15 01:40:49.674	2025-05-22 01:40:49.674
266	272	4e391489-06dc-4e46-855f-06cd5ee3b455	2025-05-15 01:40:49.686	2025-05-22 01:40:49.686
267	271	988c8a4e-fbf0-40aa-a904-a7139cacd842	2025-05-15 01:40:49.688	2025-05-22 01:40:49.688
268	273	1a148db8-839e-426c-8be9-2238aa58abc7	2025-05-15 01:40:49.718	2025-05-22 01:40:49.718
269	274	fc672181-4931-40b6-9c9c-01d96cf46a1f	2025-05-15 01:40:49.72	2025-05-22 01:40:49.72
270	275	9bbd7cf6-9529-447f-b2f4-147e0e98de88	2025-05-15 01:40:49.778	2025-05-22 01:40:49.778
271	276	d89e97b4-1b1b-4074-9d9d-9e7d49b6f9d5	2025-05-15 01:40:49.811	2025-05-22 01:40:49.811
272	278	a7f56331-567d-45f7-b296-47ccca6ba193	2025-05-15 01:40:49.839	2025-05-22 01:40:49.839
273	277	18222735-d303-4622-843c-7659b2736a93	2025-05-15 01:40:49.838	2025-05-22 01:40:49.838
274	279	746087cf-77c2-437b-a4b7-dac70c2fb614	2025-05-15 01:40:49.864	2025-05-22 01:40:49.864
275	280	39d842c1-0037-4153-85f1-40033b003961	2025-05-15 01:40:49.868	2025-05-22 01:40:49.868
276	281	4c439d16-1dc8-4338-8c04-eed7d0bd2b83	2025-05-15 01:40:49.908	2025-05-22 01:40:49.908
277	282	97488242-09b3-40f8-9b73-8d607172b710	2025-05-15 01:40:49.919	2025-05-22 01:40:49.919
278	283	c520f062-a035-4346-96f5-40953531cab5	2025-05-15 01:40:49.938	2025-05-22 01:40:49.938
279	284	8d4b527f-2713-4883-83c4-83f7bff9acdd	2025-05-15 01:40:49.945	2025-05-22 01:40:49.945
280	285	f0495525-6179-4eb8-ad01-01b3fde8562d	2025-05-15 01:40:51.164	2025-05-22 01:40:51.164
281	286	b3a65382-8d2f-4b15-910a-72ba21c970ab	2025-05-15 01:40:53.723	2025-05-22 01:40:53.723
282	287	77620e1c-60fb-40d1-b1fd-97de0f88461d	2025-05-15 02:00:19.937	2025-05-22 02:00:19.937
283	288	d79063c1-f954-486b-8061-a3337c24851c	2025-05-15 02:04:55.223	2025-05-22 02:04:55.223
284	289	b9582f07-5e13-4ce9-b95d-2ad6bc99c01c	2025-05-15 02:34:31.861	2025-05-22 02:34:31.861
285	290	63ffee94-1b2f-4428-b4fe-1782ac8006df	2025-05-15 03:24:17.369	2025-05-22 03:24:17.369
286	291	5f4cc51c-4dce-4596-99ec-99c07ebd0183	2025-05-15 04:14:12.511	2025-05-22 04:14:12.511
287	292	6df5490d-0bd7-47bd-a0cf-54ca1616b8c3	2025-05-15 04:19:11.841	2025-05-22 04:19:11.841
288	293	51fe7b8c-2176-4445-a263-533ae9c7cc7a	2025-05-15 04:39:25.251	2025-05-22 04:39:25.251
289	294	0356a386-4106-4df0-85bc-d6464e2e503c	2025-05-15 05:13:25.861	2025-05-22 05:13:25.861
290	295	f767e997-f476-4c29-9ed3-b17f2e1b9ab1	2025-05-15 05:19:15.167	2025-05-22 05:19:15.167
291	296	9b6a8410-1856-40c6-94d0-1d9f24ad06d3	2025-05-15 06:04:28.83	2025-05-22 06:04:28.83
292	297	0e4e8063-be7e-4790-ba6a-ce9ce64e42dc	2025-05-15 06:43:27.895	2025-05-22 06:43:27.895
293	298	dc496158-2b76-4ee5-8c0d-b3de8db7d4b3	2025-05-15 07:09:16.193	2025-05-22 07:09:16.193
294	299	efea90eb-4a8e-4b7f-b22e-0d4f72a183a8	2025-05-15 07:19:15.598	2025-05-22 07:19:15.598
295	300	00945591-b0be-4367-99c1-15e1e010aedb	2025-05-15 08:19:25.491	2025-05-22 08:19:25.491
296	301	2bfcf0c5-60ef-44b2-82a1-122f3a84bfad	2025-05-15 08:40:34.168	2025-05-22 08:40:34.168
297	302	b916bd11-f754-412b-a76b-4f21b9c8d4f8	2025-05-15 09:34:24.907	2025-05-22 09:34:24.907
298	303	f10a4b77-46a9-44cd-a51b-276478848bf1	2025-05-15 10:25:25.435	2025-05-22 10:25:25.435
299	304	4d9cb0e4-26af-47c0-8070-3c6ec0f911d7	2025-05-15 10:35:25.8	2025-05-22 10:35:25.8
300	305	bb717e58-2f12-4145-9f4d-186d7afa42ed	2025-05-15 11:13:43.078	2025-05-22 11:13:43.078
301	306	4c650db5-fbb0-41ce-8fe2-d64a0c0f32b9	2025-05-15 11:55:02.948	2025-05-22 11:55:02.948
302	307	07b41312-c318-4b3f-ae7e-f5b21f8a075b	2025-05-15 11:57:15.339	2025-05-22 11:57:15.339
303	308	eb81b128-0876-451d-bd06-9bccff42cf81	2025-05-15 12:19:13.105	2025-05-22 12:19:13.105
304	309	d6a9f495-642a-4b76-a353-c5c1b9e981e9	2025-05-15 12:32:25.598	2025-05-22 12:32:25.598
305	310	07fb4713-fe1b-480e-99f8-4c9d68fc47aa	2025-05-15 12:41:50.807	2025-05-22 12:41:50.807
306	311	f05bfead-4c6b-4dd2-b35b-f174d8e51619	2025-05-15 13:22:34.486	2025-05-22 13:22:34.486
307	312	85d34814-5294-4983-8d34-dec5106c3f6b	2025-05-15 13:43:11.926	2025-05-22 13:43:11.926
308	313	85d06999-3084-4271-8194-7fc805f84fb2	2025-05-15 14:09:10.96	2025-05-22 14:09:10.96
309	314	68080182-8f7f-4f7b-8466-056157b98aee	2025-05-15 14:24:08.852	2025-05-22 14:24:08.852
310	315	82d66c17-7536-420f-b19f-574321452b3c	2025-05-15 14:34:15.06	2025-05-22 14:34:15.06
311	316	6b3af23d-e7c8-449a-bd4b-6c4e1f5d2ae3	2025-05-15 15:18:46.074	2025-05-22 15:18:46.074
312	317	bf940f1a-20ed-4956-bfee-2236bec8e54c	2025-05-15 15:51:20.064	2025-05-22 15:51:20.064
313	318	65c07295-c8c3-40c0-b0aa-c55c284938d3	2025-05-15 16:29:41.753	2025-05-22 16:29:41.753
314	319	0f1bb434-5ab8-4486-b98e-57010760b7da	2025-05-15 17:16:10.668	2025-05-22 17:16:10.668
315	320	845e5d8d-d198-4a44-8bc0-744dab382e61	2025-05-15 18:04:53.73	2025-05-22 18:04:53.73
316	321	6fac8aa5-8970-45b7-9fca-29a678d66261	2025-05-15 18:59:18.318	2025-05-22 18:59:18.318
317	322	d984a6ed-9047-4588-a7d7-3d4311534d5e	2025-05-15 19:32:27.351	2025-05-22 19:32:27.351
318	323	aa6b13ba-c5ce-47cd-a541-d2374e098964	2025-05-15 20:11:35.781	2025-05-22 20:11:35.781
319	324	8942b004-49a7-4e2a-9c3c-9da0d35ab5be	2025-05-15 21:04:59.865	2025-05-22 21:04:59.865
320	325	08319616-e35c-4b5e-a78b-bff1394d4fdf	2025-05-15 21:28:27.662	2025-05-22 21:28:27.662
321	326	71a0ff5a-adf0-41e6-ab85-7aef9f611b07	2025-05-15 21:51:14.708	2025-05-22 21:51:14.708
322	327	eec9cc88-f01c-4b9a-accb-727aef0f719b	2025-05-15 23:17:06.332	2025-05-22 23:17:06.332
323	328	bc784b4c-162e-4458-9d4c-d6543abd0cf2	2025-05-15 23:51:03.632	2025-05-22 23:51:03.632
324	329	0d614e69-7a63-4a02-a8bb-f07c1da3a4b2	2025-05-16 00:10:03.272	2025-05-23 00:10:03.272
325	330	e3de3598-3d47-4e04-b7c9-270a7ae76960	2025-05-16 00:53:08.421	2025-05-23 00:53:08.421
326	331	8862ff37-a2f5-4f4b-b629-1c5b9b0cf3b8	2025-05-16 01:00:45.89	2025-05-23 01:00:45.89
327	333	8314aded-550b-4d7b-9025-c74e205a8700	2025-05-16 01:00:46.224	2025-05-23 01:00:46.224
328	332	afb3252f-7dff-41b3-a7b9-625a4e5e32b9	2025-05-16 01:00:46.222	2025-05-23 01:00:46.222
329	334	ec1e69ce-8a9e-489e-ac00-4dbab016c502	2025-05-16 01:50:01.122	2025-05-23 01:50:01.122
330	335	33b9f31e-f12d-41f7-aef1-6e6361c312df	2025-05-16 02:09:40.998	2025-05-23 02:09:40.998
331	336	8fccebd4-82d8-4afb-8e58-327246c82e6f	2025-05-16 02:38:59.365	2025-05-23 02:38:59.365
332	337	cfe2a851-a07e-4825-ae62-ec6ee1252081	2025-05-16 02:39:16.327	2025-05-23 02:39:16.327
333	338	8892ffa7-162e-48c8-bb6c-ea303407b880	2025-05-16 03:01:27.001	2025-05-23 03:01:27.001
334	339	22b121f6-e920-4898-8098-b909830f0167	2025-05-16 04:06:35.862	2025-05-23 04:06:35.862
335	340	1df9432c-3d48-4470-8b45-63475c126265	2025-05-16 04:06:37.611	2025-05-23 04:06:37.611
336	341	a7d8205b-fdaa-4960-88ba-a0b2aa5a8826	2025-05-16 04:23:40.586	2025-05-23 04:23:40.586
337	342	477feeba-ffb2-4b0f-8075-d59236a68370	2025-05-16 04:53:12.397	2025-05-23 04:53:12.397
338	343	13ded602-48e5-419c-9b49-da7d58284cee	2025-05-16 04:58:38.727	2025-05-23 04:58:38.726
339	344	e6e14254-6674-4cc5-99ae-b39a9a0b4ea0	2025-05-16 04:58:47.099	2025-05-23 04:58:47.099
340	345	ea8948d1-e88f-439d-a630-1a6e7bd1ba9b	2025-05-16 05:05:36.664	2025-05-23 05:05:36.664
341	346	f4ba699f-9243-49db-be30-edfeadf396f6	2025-05-16 05:05:49.984	2025-05-23 05:05:49.984
342	347	9aaf0cb3-a587-4537-83ee-75e25be45e2c	2025-05-16 05:14:27.221	2025-05-23 05:14:27.221
343	348	789cb4cd-563a-4470-a826-e3f068504384	2025-05-16 05:49:03.293	2025-05-23 05:49:03.293
344	349	e1462d5c-9abb-4883-86dc-d983082e4f14	2025-05-16 06:26:43.663	2025-05-23 06:26:43.663
345	350	4034816b-08ec-4231-b21f-0bd644272722	2025-05-16 07:36:23.708	2025-05-23 07:36:23.708
346	351	cadcdec1-15f3-4c15-b1d0-665097737e86	2025-05-16 09:46:05.187	2025-05-23 09:46:05.187
347	352	ab18752e-22c4-43b0-9de2-7efa27b69508	2025-05-16 10:25:16.236	2025-05-23 10:25:16.236
348	353	ce586beb-feae-42c8-8ffd-7c354d6fc3ea	2025-05-16 11:09:14.077	2025-05-23 11:09:14.077
349	354	db8a821a-7bba-405f-b102-8cc788ae1faa	2025-05-16 12:37:50.12	2025-05-23 12:37:50.12
350	355	6296b2b6-214b-49cc-a578-e6fc4557adae	2025-05-16 13:32:20.387	2025-05-23 13:32:20.387
351	356	31972797-fffc-4875-bee5-ba2216b76e0a	2025-05-16 14:55:52.288	2025-05-23 14:55:52.288
352	357	e8c185fc-ab49-44ee-87ea-5839e36911da	2025-05-16 16:06:27.029	2025-05-23 16:06:27.029
353	358	22c6a87a-740c-47f6-aa17-1976e462a668	2025-05-16 16:52:47.53	2025-05-23 16:52:47.53
354	359	355937a0-b4c0-4553-880c-b35e0ab8e4c7	2025-05-16 17:01:16.017	2025-05-23 17:01:16.017
355	360	9ca0fe37-73a8-4950-9b18-3852fc168eab	2025-05-16 17:26:20.372	2025-05-23 17:26:20.372
356	361	4e6406e7-46aa-4eb1-835c-382f24bc9191	2025-05-16 17:54:14.356	2025-05-23 17:54:14.356
357	362	73e8270e-28f5-4c34-8131-4744ff35c9ad	2025-05-16 18:15:36.938	2025-05-23 18:15:36.938
358	363	fa94e899-7265-4116-adf0-e41c7065a452	2025-05-16 19:36:46.481	2025-05-23 19:36:46.481
359	364	e9df25fa-12df-4462-883e-dd2c3d210df8	2025-05-16 21:00:31.372	2025-05-23 21:00:31.372
360	365	e5357a5a-9f05-43e1-927f-83c2aae930fe	2025-05-16 22:33:00.171	2025-05-23 22:33:00.171
361	366	c3a17a3c-b4dd-428d-af4c-d61685f0d5ee	2025-05-17 00:09:01.501	2025-05-24 00:09:01.501
362	367	2523c461-753a-4984-ba6f-61bafc3f3b14	2025-05-17 01:16:40.375	2025-05-24 01:16:40.374
363	368	c48ac30b-942b-47b9-b9ba-26d45cb5b02b	2025-05-17 01:39:04.425	2025-05-24 01:39:04.425
364	369	0d9eda1b-b3a9-48f1-aa2a-9b2be4a660c9	2025-05-17 02:01:00.881	2025-05-24 02:01:00.881
365	370	125bb523-152c-4ae7-b9b6-ee254a851616	2025-05-17 03:00:05.839	2025-05-24 03:00:05.839
366	371	50a2c132-482c-4a49-b578-389663d3bb86	2025-05-17 03:46:39.776	2025-05-24 03:46:39.776
367	372	7e06cd68-8316-4bb8-be7e-3deee1c4494a	2025-05-17 05:11:32.615	2025-05-24 05:11:32.615
368	373	bd13f29f-b442-41df-a0a5-f36604275f5a	2025-05-17 05:51:53.628	2025-05-24 05:51:53.628
369	374	7aff2de0-26e1-408a-bfb7-bb3fb2e1c70c	2025-05-17 08:02:31.757	2025-05-24 08:02:31.757
370	375	9eb2d938-a28e-48aa-90e2-df11aa2f6303	2025-05-17 08:50:25.917	2025-05-24 08:50:25.917
371	376	f62355a7-a1b1-4238-a873-5fdd0fe0cade	2025-05-17 09:24:18.813	2025-05-24 09:24:18.813
372	377	26fe7ed4-5991-4c0f-bab9-c271a57dcc84	2025-05-17 11:04:26.384	2025-05-24 11:04:26.384
373	378	5a017428-69c3-4ca2-8498-f725d7a2b7db	2025-05-17 11:29:36.029	2025-05-24 11:29:36.029
374	379	55ddd347-38ef-4dbd-a5b4-92d661cd2272	2025-05-17 12:02:06.675	2025-05-24 12:02:06.675
375	380	21dcc813-4fc4-458f-88a4-3eeb63692d42	2025-05-17 13:16:14.605	2025-05-24 13:16:14.605
376	381	1a43e408-a49f-450f-a5bf-0fe55ac6f8d7	2025-05-17 13:41:24.344	2025-05-24 13:41:24.344
377	382	5cb2ffb2-9f62-4efa-b963-e681ac9c8005	2025-05-17 14:48:38.09	2025-05-24 14:48:38.09
378	383	fc9bc4e9-29c3-4f29-b146-1f56c794558e	2025-05-17 15:14:29.952	2025-05-24 15:14:29.952
379	384	bafb6ca4-ca24-499e-adf6-b9e5c7d905eb	2025-05-17 15:51:00.792	2025-05-24 15:51:00.792
380	385	092588e6-794d-49e9-85e6-d2558e09fdc2	2025-05-17 16:24:39.048	2025-05-24 16:24:39.048
381	386	a75c33b3-c322-4b2b-8512-2456bc84b79d	2025-05-17 17:25:23.308	2025-05-24 17:25:23.307
382	387	5f2b4743-97a8-4041-afab-a3808b3b12e8	2025-05-17 17:28:10.825	2025-05-24 17:28:10.825
383	388	e0cfb225-acb3-4cf1-91db-925e7e47bd94	2025-05-17 17:29:39.703	2025-05-24 17:29:39.703
384	389	12c05dbc-cea0-4c5d-93c9-937cc907056b	2025-05-17 17:33:54.926	2025-05-24 17:33:54.926
385	390	41a6c7a6-c2ad-47bf-8f34-cc264e1dbce1	2025-05-17 17:36:05.052	2025-05-24 17:36:05.052
386	391	08e4d72d-b756-47b4-bab8-f523be413b58	2025-05-17 17:42:18.762	2025-05-24 17:42:18.762
387	392	ee246935-c65e-4722-8fc3-2bf006e83263	2025-05-17 18:46:07.691	2025-05-24 18:46:07.691
388	393	05c02773-f6ad-4a0f-ae10-fb38056f3fc5	2025-05-17 20:31:25.698	2025-05-24 20:31:25.698
389	394	37c50e82-7b99-4924-849c-a661cac0230a	2025-05-17 21:44:39.404	2025-05-24 21:44:39.404
390	395	5b48ddf1-a1e2-48e8-ac2a-0aed07185388	2025-05-17 22:00:31.333	2025-05-24 22:00:31.333
391	396	c7660a4c-4361-439c-b95e-0db46e5f341d	2025-05-17 22:19:44.083	2025-05-24 22:19:44.083
392	397	3cad6a85-5e0d-4db5-9443-aef47b0a9181	2025-05-17 22:19:44.724	2025-05-24 22:19:44.723
393	398	4a86e89a-431b-412d-b3c2-137bd9c79d86	2025-05-17 22:21:35.161	2025-05-24 22:21:35.161
394	399	236b3bfd-c65b-4e4e-9eba-01d4d5926efe	2025-05-17 22:25:51.61	2025-05-24 22:25:51.61
395	400	f8285387-7dcc-4992-a7bf-3377d261e744	2025-05-17 22:28:09.653	2025-05-24 22:28:09.653
396	401	f504aa17-7406-4e1e-989b-d6a3199facf6	2025-05-17 22:32:39.124	2025-05-24 22:32:39.124
397	402	832a5898-73d1-4273-9d32-f505e2a1d55a	2025-05-17 22:34:17.466	2025-05-24 22:34:17.465
398	403	7c9ac4fc-85ed-41df-a6c7-134f473e0f61	2025-05-17 22:49:36.542	2025-05-24 22:49:36.542
399	404	051fd82d-dbda-466d-86ca-b47c1672eea9	2025-05-17 22:51:29.607	2025-05-24 22:51:29.607
400	405	0a4d1dea-e424-4fdf-b64b-46f49b6498cd	2025-05-18 00:49:10.325	2025-05-25 00:49:10.325
401	406	0ff1c655-c3b6-4d4c-9642-6dfa948d0ea7	2025-05-18 02:19:38.817	2025-05-25 02:19:38.817
402	407	7d340d1c-dcac-4781-a9d6-a2dcefc9066e	2025-05-18 03:09:17.928	2025-05-25 03:09:17.928
403	408	e382bf09-b1b3-49c9-9cba-51c85828d7e7	2025-05-18 03:59:18.088	2025-05-25 03:59:18.088
404	409	beb5bcfc-420f-403e-bbdc-bb095dfe3517	2025-05-18 05:39:55.923	2025-05-25 05:39:55.923
405	410	a00cdb0e-9a6b-4ca4-88d3-244ae6f2956c	2025-05-18 08:09:05.159	2025-05-25 08:09:05.159
406	411	61663267-518c-4ef3-92d6-678a9e19bb58	2025-05-18 09:36:28.046	2025-05-25 09:36:28.046
407	412	911baf73-06de-4122-be49-49d9db6b4fb4	2025-05-18 10:25:29.695	2025-05-25 10:25:29.695
408	413	cbf22e5e-9951-4d31-a55f-eafdfe3e59e1	2025-05-18 10:55:07.419	2025-05-25 10:55:07.419
409	414	f4a1f02d-305f-4747-b0e5-942e5a7490e8	2025-05-18 12:01:19.52	2025-05-25 12:01:19.52
410	415	af4889f5-30e6-43ca-9e17-a7fcf034208f	2025-05-18 12:31:53.193	2025-05-25 12:31:53.193
411	416	ee01006d-b98a-4ad4-a148-80badd40a9a6	2025-05-18 14:20:18.025	2025-05-25 14:20:18.025
412	417	10550f18-ec87-4dab-acac-248ae52e5a31	2025-05-18 15:20:29.229	2025-05-25 15:20:29.229
413	418	39c5c91b-b06c-42c2-a09f-ad900b09b08e	2025-05-18 15:55:07.521	2025-05-25 15:55:07.521
414	419	7b0227df-5685-4799-a29e-0327de75f796	2025-05-18 19:01:26.877	2025-05-25 19:01:26.877
415	420	cd7691de-f28c-4707-af28-3562a00212b7	2025-05-18 20:10:46.766	2025-05-25 20:10:46.766
416	421	12006b38-9ce3-4ff1-8840-ed7df09a21cd	2025-05-18 21:53:56.59	2025-05-25 21:53:56.59
417	422	e9e3f84a-9408-45a4-8b5e-b6ebf41b5eff	2025-05-18 22:10:01.43	2025-05-25 22:10:01.43
418	423	92388a87-dbb4-44e1-8656-ce5a8f2d0249	2025-05-18 23:57:50.197	2025-05-25 23:57:50.197
419	424	80ffbda5-3e23-4584-82fc-e9e9332a65d4	2025-05-19 00:35:27.455	2025-05-26 00:35:27.455
420	425	41d45c18-c8b9-46e0-aa91-4c68c075c4fc	2025-05-19 01:30:18.621	2025-05-26 01:30:18.621
421	426	4a413ed0-5718-49ab-ba2c-717a0924b193	2025-05-19 05:04:10.058	2025-05-26 05:04:10.058
422	427	6b43fbbd-8ab4-4290-990c-1266ce28479c	2025-05-19 06:24:32.538	2025-05-26 06:24:32.538
423	428	d9d73145-d3b5-4efc-8349-210074654174	2025-05-19 06:45:18.591	2025-05-26 06:45:18.59
424	429	d0a09053-f14e-4964-990c-2a9d3520c183	2025-05-19 07:16:32.686	2025-05-26 07:16:32.686
425	430	409fdfc2-9102-4b37-9185-9f72212aebec	2025-05-19 08:19:09.816	2025-05-26 08:19:09.816
426	431	8c1e76de-3020-44c8-8fc8-cd270bf2b752	2025-05-19 10:51:44.035	2025-05-26 10:51:44.035
427	432	4220b9df-345b-4eda-8fdf-8eecff83688d	2025-05-19 11:11:50.616	2025-05-26 11:11:50.616
428	433	079074f3-a63e-4585-a941-fd71f047c831	2025-05-19 11:28:17.78	2025-05-26 11:28:17.78
429	434	7944d748-463d-47cf-b5ce-10ba3026c7c9	2025-05-19 11:48:47.22	2025-05-26 11:48:47.22
430	435	226ebb3b-664c-44b4-b0d9-46a534504d1c	2025-05-19 12:35:44.315	2025-05-26 12:35:44.315
431	436	9a07cbe9-b56f-49ed-995b-f7701d91f646	2025-05-19 14:52:10.696	2025-05-26 14:52:10.696
432	437	a7c91948-bda6-464d-ab63-844914cbe344	2025-05-19 15:32:07.796	2025-05-26 15:32:07.796
433	438	814a99ee-7769-4654-8701-f53f725b09cc	2025-05-19 16:21:18.545	2025-05-26 16:21:18.545
434	439	4f57de94-81de-4fa4-a8ce-637d79fd853c	2025-05-19 17:27:54.044	2025-05-26 17:27:54.044
435	440	b6db005f-699e-4988-b89a-a3a98fe879e8	2025-05-19 19:20:36.659	2025-05-26 19:20:36.659
436	441	a563afa5-1901-4582-a3eb-7769989736b2	2025-05-19 21:24:53.211	2025-05-26 21:24:53.211
437	442	e8cbff46-b419-4eb5-871b-7df85f107f9f	2025-05-19 21:56:54.715	2025-05-26 21:56:54.715
438	443	f6360ee4-9341-40b0-ae24-c094ce60f028	2025-05-19 22:30:13.177	2025-05-26 22:30:13.177
439	444	e7bff575-081e-494d-8499-3bf1aaa0da16	2025-05-19 23:51:01.605	2025-05-26 23:51:01.605
440	445	80c19529-f2f8-41a8-92ff-27fac18d0092	2025-05-20 03:51:53.137	2025-05-27 03:51:53.136
441	446	b3d0e363-224a-4a36-a55d-e5820f5f6759	2025-05-20 03:51:54.067	2025-05-27 03:51:54.067
442	447	d1606dab-6da6-4a43-97f9-5bf740bcd80c	2025-05-20 03:58:06.126	2025-05-27 03:58:06.126
443	448	51099a50-e09d-44e7-911a-8a97a7e5cc3b	2025-05-20 04:05:29.531	2025-05-27 04:05:29.531
444	449	14634932-4afb-4607-b76f-9142acd89e11	2025-05-20 04:06:17.652	2025-05-27 04:06:17.652
445	450	49dac94a-373d-4c6c-931a-601125d53334	2025-05-20 04:23:14.102	2025-05-27 04:23:14.102
446	451	353a6ae6-e3ea-424b-a387-1a3140dd63f1	2025-05-20 04:23:14.393	2025-05-27 04:23:14.393
447	452	4d2fe465-6a15-4174-be0c-de8ac43f933c	2025-05-20 04:23:14.549	2025-05-27 04:23:14.549
448	453	65a2b528-5a02-418e-9c18-7f9859ad60fd	2025-05-20 04:23:15.089	2025-05-27 04:23:15.089
449	454	2a00a96a-f5c8-4c06-9ec9-5bb10bf918ee	2025-05-20 04:23:15.339	2025-05-27 04:23:15.339
450	455	13d17cd5-64d3-41a7-9773-29dc07ce4fda	2025-05-20 04:25:25.054	2025-05-27 04:25:25.054
451	456	51fb503b-55c5-48b1-a4d7-10ec7b1581af	2025-05-20 04:25:25.408	2025-05-27 04:25:25.408
452	457	4643b6b5-11cf-44c4-994d-f02cbb7f8d71	2025-05-20 04:25:25.637	2025-05-27 04:25:25.637
453	458	5193e8ad-1d5c-44ba-ba47-f0e4a8b08fda	2025-05-20 04:25:25.737	2025-05-27 04:25:25.737
454	459	eaa3b696-eb5d-40a5-888e-5cf00d008c1a	2025-05-20 04:25:25.978	2025-05-27 04:25:25.978
455	460	ce04c6ef-1bf2-472b-bea3-96bcde6cdb94	2025-05-20 04:29:30.321	2025-05-27 04:29:30.321
456	461	ef210a6b-403c-4fd7-997d-7a2d815b8dad	2025-05-20 04:50:09.974	2025-05-27 04:50:09.974
457	462	22178890-75f1-449f-8ca1-6590d834df6a	2025-05-20 04:50:10.293	2025-05-27 04:50:10.293
458	463	9fd68e38-b961-4df8-a149-f03c1a9f78f5	2025-05-20 05:29:48.369	2025-05-27 05:29:48.369
459	464	aeaa604a-8b72-420c-9f0a-d648bd504711	2025-05-20 05:55:42.355	2025-05-27 05:55:42.355
460	465	8a27c7eb-4a1a-497e-9ad7-4384a20cf92f	2025-05-20 06:21:37.845	2025-05-27 06:21:37.845
461	466	276be277-e305-43fc-ad07-b46a559bb831	2025-05-20 06:50:55.78	2025-05-27 06:50:55.78
462	467	b0c3384f-7b81-4c9e-9786-8222b9284347	2025-05-20 07:26:52.261	2025-05-27 07:26:52.261
463	468	a5c90c9d-623a-4882-83ed-88721c5ede9a	2025-05-20 07:50:29.121	2025-05-27 07:50:29.121
464	469	068cb96f-fb01-40da-8141-5aa08624a350	2025-05-20 08:10:27.167	2025-05-27 08:10:27.167
465	470	dd960f78-a73b-41e1-bf37-65a2a5fd563a	2025-05-20 08:53:02.589	2025-05-27 08:53:02.589
466	471	463c9fd6-7fe9-4b42-8d79-0662f4a91b50	2025-05-20 10:04:41.241	2025-05-27 10:04:41.241
467	472	50e7789b-7a92-41be-ac2c-7d0a097d67e8	2025-05-20 10:20:48.622	2025-05-27 10:20:48.622
468	473	9fe7e2ef-2f53-40a1-91f2-1bdcef1a633b	2025-05-20 11:49:28.283	2025-05-27 11:49:28.283
469	474	b77c2599-89f5-4e1c-8aa1-19a98e92489d	2025-05-20 12:56:19.545	2025-05-27 12:56:19.545
470	475	609ae7cf-4317-48b2-953d-d8b374b2139d	2025-05-20 13:19:18.794	2025-05-27 13:19:18.794
471	476	7bbc64c0-c730-48d7-bbe6-a163ee79363f	2025-05-20 14:04:24.248	2025-05-27 14:04:24.248
472	477	bbeee6ce-4225-41b9-b7dc-300e7654f7e5	2025-05-20 18:56:48.431	2025-05-27 18:56:48.431
473	478	3738ee43-af8a-4cf6-b603-6b432394f3a6	2025-05-20 19:38:47.561	2025-05-27 19:38:47.561
474	479	80c53c9c-073e-488e-81fa-00747a917c79	2025-05-20 19:44:43.731	2025-05-27 19:44:43.731
475	480	09fb145e-761d-4695-abce-ceb8855fc780	2025-05-20 19:55:53.611	2025-05-27 19:55:53.611
476	481	de755e70-2abd-45e8-9b05-2f0b4fd94819	2025-05-20 20:34:40.542	2025-05-27 20:34:40.542
477	482	39608e96-0509-4bbd-b333-5a662cb2e9db	2025-05-20 21:18:05.556	2025-05-27 21:18:05.556
478	483	12f4d7c6-3c07-49a1-90b4-34db51e26dcc	2025-05-20 22:01:29.991	2025-05-27 22:01:29.991
479	484	5ddf0625-2d84-439c-9be1-140bcd7e8f1c	2025-05-20 22:16:58.747	2025-05-27 22:16:58.747
480	485	e57105b4-efd3-44ab-8851-f5bb3a5784ea	2025-05-20 22:38:55.144	2025-05-27 22:38:55.144
481	486	f8143f3c-4eaa-49a6-9997-061bbfff8341	2025-05-20 22:50:16.574	2025-05-27 22:50:16.574
482	487	48c06181-2c0e-4033-bcfd-16f24f65bdbe	2025-05-20 23:18:35.435	2025-05-27 23:18:35.435
483	488	cd781c3c-d202-404c-9738-b913ec55747f	2025-05-20 23:56:52.591	2025-05-27 23:56:52.591
484	489	742c24cf-2d65-41ae-b6fd-ce35088ec252	2025-05-21 00:23:57.476	2025-05-28 00:23:57.476
485	490	04cd5df4-4245-4638-ac5f-36fcd25be720	2025-05-21 00:23:57.833	2025-05-28 00:23:57.833
486	491	d01b3877-f442-49c7-ba34-713c503f2709	2025-05-21 00:23:57.992	2025-05-28 00:23:57.992
487	492	c941297f-b874-4aca-a2ec-e3ace673d90b	2025-05-21 00:23:59.014	2025-05-28 00:23:59.014
488	493	e6991236-0e3b-4757-8838-4f66d390e57d	2025-05-21 00:23:59.398	2025-05-28 00:23:59.398
489	494	40174cc7-109b-40f0-81a8-450ee0c66bd3	2025-05-21 01:12:44.202	2025-05-28 01:12:44.202
490	495	fc150f50-65aa-4657-9a28-b94921725de5	2025-05-21 02:27:58.855	2025-05-28 02:27:58.855
491	496	5b70adc6-b1fe-4272-b4d9-7ce5189a5a76	2025-05-21 02:50:32.617	2025-05-28 02:50:32.617
492	497	90b4f966-660b-4ac2-ba66-29d946a3035f	2025-05-21 04:16:06.299	2025-05-28 04:16:06.299
493	498	116c90a3-42ae-4610-bb4b-d586b6c4d2e7	2025-05-21 04:16:06.803	2025-05-28 04:16:06.803
494	499	5b73dc03-58c6-4361-a3d3-c1e0bab701ed	2025-05-21 04:16:07.139	2025-05-28 04:16:07.138
495	500	ebd1b1d1-ef1b-4a8b-8463-cf3475f4d949	2025-05-21 04:16:07.306	2025-05-28 04:16:07.306
496	501	e0d24f59-30a0-48f6-bab0-531a8ed3ad03	2025-05-21 04:16:08.188	2025-05-28 04:16:08.188
497	502	26380955-b593-4b80-ad6e-8c53dc651ccf	2025-05-21 04:16:08.417	2025-05-28 04:16:08.416
498	503	d9b6bf78-574b-4411-aeaa-6ef573407cde	2025-05-21 05:17:24.562	2025-05-28 05:17:24.562
499	504	8e0520b8-a0c9-4d53-aeea-fe4b7cbc36ec	2025-05-21 05:50:09.033	2025-05-28 05:50:09.033
500	505	23aa1c0f-0b0a-454c-b12b-671753204903	2025-05-21 06:42:30.593	2025-05-28 06:42:30.593
501	506	04d9d050-5109-404d-baf8-062668c6b85a	2025-05-21 06:58:47.602	2025-05-28 06:58:47.602
502	507	738db3a3-2ab0-4253-8e90-9d68137ecc15	2025-05-21 07:47:55.074	2025-05-28 07:47:55.074
503	508	72653f5f-a85e-46e2-99fb-79c8bfc842b4	2025-05-21 08:32:42.097	2025-05-28 08:32:42.097
504	509	8592ac27-39e9-4bed-9657-a57b7ed5bf1d	2025-05-21 10:22:39.538	2025-05-28 10:22:39.538
505	510	cc90d72b-4f4b-4e34-9c27-85b1f2d7bdaf	2025-05-21 10:42:56.693	2025-05-28 10:42:56.693
506	511	ccbf89c0-b7ee-45f7-9985-c6e6fced3d24	2025-05-21 12:34:15.015	2025-05-28 12:34:15.015
507	512	a89e9dde-40a5-4304-8e38-e5d67a406b18	2025-05-21 13:02:00.895	2025-05-28 13:02:00.895
508	513	4e33996d-9c79-47dc-902c-d22809527119	2025-05-21 13:14:41.237	2025-05-28 13:14:41.236
509	514	aca22b6e-0f78-47ff-b6a9-1a87e5264af5	2025-05-21 13:15:00.926	2025-05-28 13:15:00.926
510	515	7ca6601a-40a3-4578-ad06-70d645908ae0	2025-05-21 14:42:28.997	2025-05-28 14:42:28.992
511	516	739cdb34-6948-4a9a-a70c-7cc47dd4fd55	2025-05-21 15:35:18.607	2025-05-28 15:35:18.607
512	517	fcd8829c-1926-4ee7-ac80-a4e3101e63de	2025-05-21 16:13:01.671	2025-05-28 16:13:01.671
513	518	0192a597-ef49-4208-b13a-78774008d5b7	2025-05-21 16:58:10.832	2025-05-28 16:58:10.832
514	519	6c3bb533-2f1f-4c30-9089-6fca617baeaa	2025-05-21 17:13:05.876	2025-05-28 17:13:05.876
515	520	efd48910-2b05-4a78-84b4-b649116e4bf6	2025-05-21 17:53:11.433	2025-05-28 17:53:11.433
516	521	40a6eb5d-2a9b-4421-9811-cb7bf2edf787	2025-05-21 18:01:08.492	2025-05-28 18:01:08.492
517	522	dd4c73e3-6521-466f-8aec-f2ec359a37d7	2025-05-21 18:02:20.101	2025-05-28 18:02:20.101
518	523	c40eff3f-5ee3-46de-bed3-013a82403d92	2025-05-21 18:05:22.213	2025-05-28 18:05:22.213
519	524	892bf7fe-5370-4aab-ae4d-69072b76cbe0	2025-05-21 18:06:53.958	2025-05-28 18:06:53.958
520	525	3397074f-8a88-4049-b6a6-95e9e7e9dad6	2025-05-21 18:15:32.324	2025-05-28 18:15:32.324
521	526	52f978a3-f5ff-4355-9bad-8c1bfccfb8d7	2025-05-21 18:23:07.177	2025-05-28 18:23:07.177
522	527	85a91cbf-d60a-4d9d-aded-ccdfd29d722d	2025-05-21 18:31:59.118	2025-05-28 18:31:59.118
523	528	9fb81890-2a1b-47bc-ab8a-f34ef00d20e0	2025-05-21 18:41:56.816	2025-05-28 18:41:56.816
524	529	1ad106f4-baaf-4bc8-b7a4-04f190f48790	2025-05-21 19:01:14.389	2025-05-28 19:01:14.389
525	530	cf6e5c23-91ea-47d6-9307-863c5ba01c33	2025-05-21 19:21:09.093	2025-05-28 19:21:09.093
526	531	019240a8-91a0-4696-9ded-3ba7eb1c3d34	2025-05-21 20:13:15.45	2025-05-28 20:13:15.45
527	532	e1869012-80d3-4781-ba7c-656a475fac43	2025-05-21 20:24:44.803	2025-05-28 20:24:44.803
528	533	48dc9f77-cd4e-4ada-9803-247ef8cddd23	2025-05-21 20:58:18.263	2025-05-28 20:58:18.263
529	534	4afa5c55-b4e8-4224-bdaf-e78e47c95426	2025-05-21 21:03:08.792	2025-05-28 21:03:08.792
530	535	999753ed-8c02-4099-984c-de8d466ea8a5	2025-05-21 21:03:46.676	2025-05-28 21:03:46.676
531	536	8940de26-b7ce-433c-a1ce-d934bc8107bb	2025-05-21 21:06:35.826	2025-05-28 21:06:35.825
532	537	64667034-f03f-4b72-a17f-7442ffef9a47	2025-05-21 21:53:02.259	2025-05-28 21:53:02.258
533	538	cd92d20e-b472-4a78-8360-d0d483a8bef0	2025-05-21 22:59:01.776	2025-05-28 22:59:01.776
534	539	a44621bd-2a15-4abc-9d26-30032061b077	2025-05-21 23:15:29.13	2025-05-28 23:15:29.13
535	540	1e9d2ec7-7e89-4dbe-9e80-18f0df973d3e	2025-05-21 23:30:34.136	2025-05-28 23:30:34.136
536	541	ac93e7a7-6976-4cdf-bd0e-8145453dc409	2025-05-21 23:31:02.136	2025-05-28 23:31:02.136
537	542	041e93f4-4c50-4072-90de-28584940b8bc	2025-05-21 23:43:01.688	2025-05-28 23:43:01.688
538	543	6f6653bf-0653-46e8-96d2-e774364e079f	2025-05-21 23:56:01.384	2025-05-28 23:56:01.384
539	544	d76dd79a-4534-4853-b974-e79225a727cf	2025-05-22 01:34:19.296	2025-05-29 01:34:19.296
540	545	7fc565ff-e5ee-4008-ac99-ef05afd4bf67	2025-05-22 01:41:50.176	2025-05-29 01:41:50.176
541	546	75decaa8-2d2d-4e0d-b847-6ef97b91983d	2025-05-22 01:41:51.505	2025-05-29 01:41:51.505
542	547	cf1c92bb-c755-4e83-a839-783de97c255d	2025-05-22 02:24:45.503	2025-05-29 02:24:45.503
543	548	e1e658c3-933a-47cf-9069-dd72a88cd08b	2025-05-22 02:38:36.321	2025-05-29 02:38:36.321
544	549	d18d82a5-082b-4de5-a2a0-c9795a10c6b1	2025-05-22 03:45:04.553	2025-05-29 03:45:04.553
545	550	2717c981-155d-4123-95a2-673920445b9e	2025-05-22 04:00:33.919	2025-05-29 04:00:33.919
546	551	67ed6f72-d834-457b-b17c-70ddd2aa1ee0	2025-05-22 04:00:40.535	2025-05-29 04:00:40.535
547	552	9651cef1-597d-4a9f-a035-dfe356c50880	2025-05-22 04:00:40.961	2025-05-29 04:00:40.961
548	553	f670b4db-8cec-4f9a-8de1-1199ab7c70c6	2025-05-22 04:00:41.219	2025-05-29 04:00:41.219
549	554	b5f768e2-d7e6-49f1-a09e-f17aa098b3ee	2025-05-22 04:00:41.464	2025-05-29 04:00:41.464
550	555	381b181f-787e-448a-adb0-a290fb9a2e3d	2025-05-22 04:00:41.764	2025-05-29 04:00:41.763
551	556	0cfafdbc-b3e8-4d68-be90-b0140cc7d971	2025-05-22 04:00:42.042	2025-05-29 04:00:42.042
552	557	e7ba5d9c-7e67-42bd-bc9e-9b9467973923	2025-05-22 04:00:42.331	2025-05-29 04:00:42.33
553	558	eea237fc-500c-46cc-847d-2892c80b05a1	2025-05-22 04:00:42.571	2025-05-29 04:00:42.571
554	559	369b066b-1766-4589-9bf2-8a2dee5a8d3e	2025-05-22 04:00:42.852	2025-05-29 04:00:42.852
555	560	6981f27f-66d3-46d4-bbe7-c374069a6f7c	2025-05-22 04:00:43.101	2025-05-29 04:00:43.101
556	561	f3a526ee-49da-4789-9ecc-89321234bf09	2025-05-22 04:00:43.338	2025-05-29 04:00:43.338
557	562	87dcefbb-0d72-42e2-b361-8cea0cd7b67b	2025-05-22 04:00:43.652	2025-05-29 04:00:43.652
558	563	d199e4ce-8f7a-4fb1-97f4-3194e4a5414b	2025-05-22 04:00:43.884	2025-05-29 04:00:43.884
559	564	b020ae60-b667-4c47-93d7-973bdf85d702	2025-05-22 04:00:44.119	2025-05-29 04:00:44.119
560	565	465cf419-0bbe-403f-ad9b-27ab6b9c9b8d	2025-05-22 04:00:44.361	2025-05-29 04:00:44.361
561	566	9b799d2d-055b-4b55-8367-dc1f7d33d755	2025-05-22 04:00:44.595	2025-05-29 04:00:44.595
562	567	71b17aa3-f2aa-4c82-9b16-6c898934de3e	2025-05-22 04:00:44.858	2025-05-29 04:00:44.858
563	568	2e2e011f-f266-4114-a0ba-dff2d619b15b	2025-05-22 04:00:45.116	2025-05-29 04:00:45.116
564	569	b7d08f71-629a-4b4d-b468-0994e4bafc44	2025-05-22 04:00:45.372	2025-05-29 04:00:45.372
565	570	6398d524-ce7a-430b-95e0-d68e9a7ae320	2025-05-22 04:00:45.608	2025-05-29 04:00:45.608
566	571	4b377f3b-72fd-4b15-aa59-58706d414358	2025-05-22 04:00:45.851	2025-05-29 04:00:45.851
567	572	e6d2e950-6999-496f-a30e-7adbf39e6406	2025-05-22 04:00:46.085	2025-05-29 04:00:46.085
568	573	4a10fe96-07ed-4664-a359-200768162ca7	2025-05-22 04:00:51.023	2025-05-29 04:00:51.023
569	574	58578b32-b9ae-4284-95b1-87195dde3170	2025-05-22 04:00:57.646	2025-05-29 04:00:57.646
570	575	bfc4c152-8437-47c2-ba9f-3ad95733e3e3	2025-05-22 04:01:10.102	2025-05-29 04:01:10.102
571	576	d914def9-cb86-44f7-ba10-bc5660bf01c6	2025-05-22 04:01:16.106	2025-05-29 04:01:16.106
572	577	720b8523-073b-49c6-8f43-bf1ed4bd89ba	2025-05-22 04:06:03.507	2025-05-29 04:06:03.507
573	578	60b390ef-2504-4748-9935-ea7e7e560ec0	2025-05-22 04:11:05.278	2025-05-29 04:11:05.278
574	579	67766d3e-6672-4f8a-b76f-53eb65cc0791	2025-05-22 04:11:05.568	2025-05-29 04:11:05.568
575	580	99f6afb4-633d-4120-9fb2-8878c0e9e331	2025-05-22 04:11:05.768	2025-05-29 04:11:05.768
576	581	ab8ccef0-aeac-43cc-9387-91098d9022b5	2025-05-22 04:11:05.786	2025-05-29 04:11:05.786
577	582	12bcefb4-1cc1-4930-a894-6d24b1845dbd	2025-05-22 04:11:24.885	2025-05-29 04:11:24.885
578	583	52401aa0-a1eb-4a7d-9fa9-d778cfdc3724	2025-05-22 04:11:25.108	2025-05-29 04:11:25.108
579	584	5cbd991a-6080-4933-9a69-66c89daf1402	2025-05-22 04:11:25.273	2025-05-29 04:11:25.273
580	585	b8461a7f-c6fa-49bf-be2c-00c8ac20c674	2025-05-22 04:11:25.285	2025-05-29 04:11:25.285
581	586	a993128d-abd4-4f6a-aa02-0d7574bb6e60	2025-05-22 04:11:56.662	2025-05-29 04:11:56.662
582	587	fe843e82-777b-417f-84de-799d0375475f	2025-05-22 04:11:56.891	2025-05-29 04:11:56.891
583	588	e956ed18-561d-4e2e-95ff-3e622e4bb52b	2025-05-22 04:11:57.031	2025-05-29 04:11:57.031
584	589	0990b23d-0138-4426-a5e0-a8c1a4dc14e3	2025-05-22 04:11:57.033	2025-05-29 04:11:57.033
585	590	edce8924-181a-414c-85fd-993b2032f623	2025-05-22 04:12:09.562	2025-05-29 04:12:09.562
586	591	4b69d65e-0100-48c7-8a15-83182b0e231a	2025-05-22 04:12:09.812	2025-05-29 04:12:09.812
587	592	6f04ea10-4cb4-41b3-b90e-fc92935197e4	2025-05-22 04:12:09.958	2025-05-29 04:12:09.958
588	593	9653f775-3cd2-46a6-b100-ed9fa2ef8bc8	2025-05-22 04:12:09.977	2025-05-29 04:12:09.977
589	594	2b10c8bf-e712-4b23-af32-71fd59133598	2025-05-22 04:14:04.755	2025-05-29 04:14:04.755
590	595	6ea8adaf-0bfe-415d-8aa2-6c6a75688865	2025-05-22 04:17:18.115	2025-05-29 04:17:18.115
591	596	27c593b0-c488-4a93-853c-a8068ec44806	2025-05-22 04:23:14.828	2025-05-29 04:23:14.828
592	597	f9834071-ae0c-4e3d-a218-143ea8a86696	2025-05-22 04:24:01.245	2025-05-29 04:24:01.245
593	598	12035af1-dd4b-4056-8a50-fe2e58f0ea29	2025-05-22 04:28:38.909	2025-05-29 04:28:38.909
594	599	2d6acded-6745-4b37-a414-24cdcdd73798	2025-05-22 04:38:17.017	2025-05-29 04:38:17.017
595	600	b07f3210-f516-4f70-952a-74bb3e61e1f1	2025-05-22 04:40:22.954	2025-05-29 04:40:22.954
596	601	bdd57bdb-239a-4956-a33f-b4f6d290fc90	2025-05-22 04:41:57.807	2025-05-29 04:41:57.807
597	602	19cf6a38-47e7-487e-a2b5-cac1c396e1da	2025-05-22 04:41:58.128	2025-05-29 04:41:58.128
598	603	9cb1305f-cdb9-4c17-a062-4cec8f0e099f	2025-05-22 04:41:58.604	2025-05-29 04:41:58.604
599	604	e816d25f-efe9-41f4-b1a7-4c9fb132f966	2025-05-22 04:41:58.866	2025-05-29 04:41:58.866
600	605	7fa0433e-436c-4766-a92f-4e5cb9bf8fa1	2025-05-22 04:41:59.137	2025-05-29 04:41:59.137
601	606	68ee9607-a79c-48c1-9341-d8e87000fdda	2025-05-22 05:03:14.327	2025-05-29 05:03:14.327
602	607	02039847-710c-42d8-bc33-7f91a340e782	2025-05-22 05:05:09.839	2025-05-29 05:05:09.839
603	608	b051b5d1-ce27-4372-9594-b828037a82e5	2025-05-22 05:06:47.61	2025-05-29 05:06:47.61
604	609	eef20ec4-53c2-4370-ae72-5313b59fff93	2025-05-22 05:08:49.266	2025-05-29 05:08:49.266
605	610	1fceb2ca-61cd-407d-aad7-4b56639848c4	2025-05-22 05:12:13.957	2025-05-29 05:12:13.957
606	611	70797e03-d5cd-45a4-aaf7-e8a6f1cb3fcf	2025-05-22 05:16:04.349	2025-05-29 05:16:04.349
607	612	dc78ea7c-d46d-4a2e-970f-7f960a76baf1	2025-05-22 05:21:59.129	2025-05-29 05:21:59.129
608	613	1392fd78-9816-4aee-9b02-a725029fc3c6	2025-05-22 05:25:11.358	2025-05-29 05:25:11.358
609	614	04d299f0-b3aa-4344-aca3-81ff27731146	2025-05-22 05:28:32.598	2025-05-29 05:28:32.598
610	615	f68f5a17-b2b4-4101-a782-ef409cbcae30	2025-05-22 05:45:28.15	2025-05-29 05:45:28.15
611	616	bc2d53e9-f98f-4659-b6df-5446822ce11b	2025-05-22 05:55:58.946	2025-05-29 05:55:58.946
612	617	36e324bf-41d3-4df7-89f5-e993d0bc23d1	2025-05-22 06:02:21.235	2025-05-29 06:02:21.235
613	618	141f8d7a-8b35-4f72-a786-e96f17c50bce	2025-05-22 06:04:32.467	2025-05-29 06:04:32.467
614	619	aea28f36-3700-42f8-9eb4-eb5a4fc2f1e9	2025-05-22 06:16:52.565	2025-05-29 06:16:52.565
615	620	afd5d2f3-33cc-4cdc-be9b-9cab60e7374d	2025-05-22 06:22:56.671	2025-05-29 06:22:56.671
616	621	aff886d8-a9cb-42bf-8b45-eed66dea7d3f	2025-05-22 06:22:56.98	2025-05-29 06:22:56.98
617	622	0d04fd0e-b956-4ac4-83b0-b99de507bcc8	2025-05-22 06:22:57.142	2025-05-29 06:22:57.142
618	623	b67c11f9-7f6e-45e3-a0a1-cfccbcc0af55	2025-05-22 06:22:59.138	2025-05-29 06:22:59.138
619	624	03863622-eec5-411d-a1f8-eeec87abdedf	2025-05-22 06:23:31.317	2025-05-29 06:23:31.317
620	625	32418ab3-f09a-4258-bcb6-2ee9ab72c523	2025-05-22 06:23:31.586	2025-05-29 06:23:31.585
621	626	78833075-168c-46a5-a2d9-3140d652b157	2025-05-22 06:23:31.73	2025-05-29 06:23:31.73
622	627	98e4a3aa-ca5f-46c2-84ad-b283fbad677f	2025-05-22 06:23:31.735	2025-05-29 06:23:31.735
623	628	ad016c16-6e43-4fa5-a65e-751500051913	2025-05-22 06:32:25.228	2025-05-29 06:32:25.228
624	629	dad04cca-82b2-4844-a6b6-e7431620c3cd	2025-05-22 06:32:25.509	2025-05-29 06:32:25.508
625	631	997a6f13-f2e9-43ca-973e-2873c0bea004	2025-05-22 06:32:25.699	2025-05-29 06:32:25.699
626	630	943c3620-f145-46ec-886f-174008969a4e	2025-05-22 06:32:25.701	2025-05-29 06:32:25.701
627	632	eda8385a-67bb-4161-a4b2-205fcc66d94f	2025-05-22 06:35:09.109	2025-05-29 06:35:09.109
628	633	5ed1dc76-f432-4ecf-b1ea-594c63701509	2025-05-22 06:35:09.374	2025-05-29 06:35:09.374
629	634	a174c75e-b16a-489a-95e6-9387d020abbf	2025-05-22 06:35:09.536	2025-05-29 06:35:09.536
630	635	af236774-244a-4c73-a910-a4e5904ce65b	2025-05-22 06:35:09.542	2025-05-29 06:35:09.542
631	636	45e0d4d2-3cde-4f9f-abb0-0564856842a3	2025-05-22 06:43:42.675	2025-05-29 06:43:42.675
632	637	bd6f325c-259f-4078-acf5-bd8a36263d43	2025-05-22 07:03:34.574	2025-05-29 07:03:34.574
633	638	b7a828e3-06a7-4f28-bb12-8b8e3cfe790c	2025-05-22 08:46:13.288	2025-05-29 08:46:13.288
634	639	0bcab289-2cfd-4f18-a66c-6c86ed3c9b7e	2025-05-22 08:46:15.918	2025-05-29 08:46:15.918
635	640	edc25c47-3792-4696-a6d7-e5fe3fd895b5	2025-05-22 10:10:07.406	2025-05-29 10:10:07.406
636	641	6d586b95-ec64-464d-a244-fc762546035d	2025-05-22 10:10:07.868	2025-05-29 10:10:07.867
637	642	6327a802-0e5a-42f7-a3a6-dbc266b60fa9	2025-05-22 10:10:14.33	2025-05-29 10:10:14.33
638	643	b90fb741-b65f-43cb-9f19-827e3ad13f4a	2025-05-22 10:10:14.818	2025-05-29 10:10:14.818
639	644	a5928c76-842c-40e0-8144-e2f6f782289a	2025-05-22 10:10:15.271	2025-05-29 10:10:15.271
640	645	8fca9ae0-86b4-4506-9563-7dc226ac35a2	2025-05-22 10:10:15.695	2025-05-29 10:10:15.695
641	646	a9523d8a-6e94-41b8-942c-52febe8bc402	2025-05-22 10:10:16.104	2025-05-29 10:10:16.104
642	647	d382d3b9-9782-41bb-bff0-bf71a468498c	2025-05-22 10:10:16.556	2025-05-29 10:10:16.556
643	648	c0218d57-1446-47cd-8aab-8e0f205cd281	2025-05-22 10:10:16.967	2025-05-29 10:10:16.967
644	649	1d33ddfb-0086-4e08-90b3-54812cb7b7d6	2025-05-22 10:10:17.412	2025-05-29 10:10:17.412
645	650	db9290f2-edba-465b-bd10-fd897eaac687	2025-05-22 10:10:17.848	2025-05-29 10:10:17.848
646	651	79dd1495-9d27-4dcf-a6bc-20bc7b677f05	2025-05-22 10:10:18.272	2025-05-29 10:10:18.272
647	652	17e11c01-a635-46d5-834d-4a20291a74be	2025-05-22 10:10:18.685	2025-05-29 10:10:18.685
648	653	244b2008-2a73-4722-bc78-2936c0906e74	2025-05-22 10:10:19.125	2025-05-29 10:10:19.125
649	654	900892bc-f8e1-4b8c-bf35-2470bef3c468	2025-05-22 10:10:19.568	2025-05-29 10:10:19.568
650	655	7b70a4b8-3d53-4837-b112-b331417ec186	2025-05-22 10:10:19.996	2025-05-29 10:10:19.996
651	656	68fc280b-061e-4c93-a15c-79355bcf11c1	2025-05-22 10:10:20.423	2025-05-29 10:10:20.423
652	657	835abff8-1e42-4cdc-9539-3c75b1e5970a	2025-05-22 10:10:20.877	2025-05-29 10:10:20.877
653	658	a7aa4e7e-6e61-4ec2-ad60-70a97d2e7aa3	2025-05-22 10:10:21.325	2025-05-29 10:10:21.325
654	659	63a4b451-e715-4a63-8083-08fbb21ef0b6	2025-05-22 10:10:21.733	2025-05-29 10:10:21.733
655	660	b60da948-23a8-4dff-92f7-4bca06b06409	2025-05-22 10:10:22.172	2025-05-29 10:10:22.172
656	661	03099ded-607f-48eb-8520-88b958b47ec9	2025-05-22 10:10:22.605	2025-05-29 10:10:22.605
657	662	1821e32b-b7fc-4bbd-8aa1-b0ab69026107	2025-05-22 10:10:23.026	2025-05-29 10:10:23.026
658	663	6eeb4097-7943-40c6-8ad4-155e501a7318	2025-05-22 10:10:23.468	2025-05-29 10:10:23.468
659	664	4f312ef0-10a0-4b37-8284-6f58cb07a6fb	2025-05-22 10:10:23.889	2025-05-29 10:10:23.889
660	665	a3a43f90-a73d-44de-8e25-74d29cc2230d	2025-05-22 10:10:24.313	2025-05-29 10:10:24.313
661	666	065aefa1-50d7-412d-8af7-7280f92fe34a	2025-05-22 10:10:24.72	2025-05-29 10:10:24.72
662	667	75cea47c-1b2c-4d02-aeb3-855cd45c0ae9	2025-05-22 10:10:25.13	2025-05-29 10:10:25.13
663	668	353fa184-3931-4bb8-b3fd-b48fd94ea32a	2025-05-22 10:10:25.568	2025-05-29 10:10:25.568
664	669	1fbc9fff-2130-47a9-96c3-825818bd9fa1	2025-05-22 10:10:26.022	2025-05-29 10:10:26.022
665	670	d1348d5e-fb5d-4e23-927d-99bed9f9e7cd	2025-05-22 10:10:26.461	2025-05-29 10:10:26.461
666	671	f9a5e691-c31d-468e-8d86-c3d660138438	2025-05-22 10:10:26.9	2025-05-29 10:10:26.9
667	672	04663390-1514-4725-82b4-7ddd8e3de2ce	2025-05-22 10:10:27.351	2025-05-29 10:10:27.351
668	673	cc5b2c7a-0727-4d2e-b461-ff70e0ca411b	2025-05-22 10:10:27.771	2025-05-29 10:10:27.771
669	674	dca9edd5-218a-409b-a3b7-5a588cbba0cc	2025-05-22 10:10:28.213	2025-05-29 10:10:28.213
670	675	95121e87-ee1e-42ef-9569-5cff5b01cd92	2025-05-22 10:10:28.648	2025-05-29 10:10:28.648
671	676	a0e10499-830f-420f-8082-8b2e6f9b86c4	2025-05-22 11:29:33.914	2025-05-29 11:29:33.914
672	677	2dac3623-a153-453a-9f59-943bf6ed2b85	2025-05-22 11:29:37.598	2025-05-29 11:29:37.598
673	678	318ec773-579b-4e50-b22d-4493c17d32fe	2025-05-22 12:26:15.676	2025-05-29 12:26:15.676
674	679	cf6f9a3b-ac35-42e9-9068-4847243850f0	2025-05-22 12:26:17.654	2025-05-29 12:26:17.654
675	680	c064eddb-2b99-4854-b453-d8af17d9da29	2025-05-22 12:26:19.788	2025-05-29 12:26:19.788
676	681	c9cfc1c5-48ac-4b7a-a88f-5fd1451469b5	2025-05-22 13:14:39.902	2025-05-29 13:14:39.902
677	682	fbe9248f-7ecd-453d-bf1a-45e18b6f5eaa	2025-05-22 13:14:40.254	2025-05-29 13:14:40.254
678	683	8fdd0823-0e3f-4a06-9280-1ee329d86668	2025-05-22 13:14:40.436	2025-05-29 13:14:40.436
679	684	89181d6d-7b33-49d6-aaa6-5da233f6ce8a	2025-05-22 13:14:41.602	2025-05-29 13:14:41.602
680	685	f3180a08-5394-4e17-9264-268bd7ac1614	2025-05-22 13:14:41.812	2025-05-29 13:14:41.812
681	686	65bc0b2f-40da-403b-b993-5e12c69e3dbb	2025-05-22 13:40:49.35	2025-05-29 13:40:49.35
682	687	29857a99-ba14-427f-9017-cac5e21dbe3d	2025-05-22 13:41:29.264	2025-05-29 13:41:29.264
683	688	833ae359-1639-4443-9d2e-46d4a4811cbd	2025-05-22 13:42:48.688	2025-05-29 13:42:48.688
684	689	bf6a723b-b07e-4d64-ba05-d5ebc65e8154	2025-05-22 14:00:04.317	2025-05-29 14:00:04.317
685	690	61df7e6f-8d6d-40ad-a8f2-26e0fe2f856c	2025-05-22 14:18:47.578	2025-05-29 14:18:47.578
686	691	68792855-1785-4439-b32e-d09b20094017	2025-05-22 14:18:47.592	2025-05-29 14:18:47.592
687	692	77971e75-1592-4d1a-93c3-bfffda457ad5	2025-05-22 14:18:49.42	2025-05-29 14:18:49.42
688	694	2aacca1d-33f3-4a1b-8d84-30778149fcfb	2025-05-22 14:18:49.837	2025-05-29 14:18:49.837
689	693	73c4ebcc-c85f-4261-b451-6fb59ab63613	2025-05-22 14:18:49.839	2025-05-29 14:18:49.839
690	695	a686a32f-3fb6-4372-b7aa-61428d286742	2025-05-22 14:18:51.039	2025-05-29 14:18:51.039
691	696	9e000624-af17-4f78-be18-a127fdef324a	2025-05-22 14:18:51.168	2025-05-29 14:18:51.168
692	697	a16686ce-8e7d-4f20-b8f9-b2c576d591f8	2025-05-22 14:18:51.554	2025-05-29 14:18:51.554
693	698	70c23b31-b8bb-4c97-bdf4-2678a3a5d3d0	2025-05-22 14:18:52.442	2025-05-29 14:18:52.442
694	699	4f10767d-769c-46ad-bf23-76e2d34da0df	2025-05-22 14:18:52.444	2025-05-29 14:18:52.444
695	700	80d6001b-f8b4-41ac-aa7f-d8876feab1d5	2025-05-22 14:18:52.445	2025-05-29 14:18:52.445
696	701	cbbaa97a-0510-41c3-b151-4ac3eac64ead	2025-05-22 14:18:52.557	2025-05-29 14:18:52.556
697	703	19e55f3d-291c-45e9-826d-26451cc482b8	2025-05-22 14:18:52.635	2025-05-29 14:18:52.635
698	702	15cddd76-8cbc-47a9-8068-4646bad2d894	2025-05-22 14:18:52.635	2025-05-29 14:18:52.635
699	704	f273b907-7c86-4dd7-932f-1246a92814f9	2025-05-22 14:18:52.696	2025-05-29 14:18:52.696
700	705	8686afee-867a-429f-880c-0eb0a242bd25	2025-05-22 14:18:52.767	2025-05-29 14:18:52.767
701	706	0aff2f71-1849-4c7b-8aaa-d8cce22175ac	2025-05-22 14:18:52.795	2025-05-29 14:18:52.795
702	707	71c1391d-6637-4bbe-8bbf-5693072a7940	2025-05-22 14:18:52.831	2025-05-29 14:18:52.831
703	708	3c615172-82f1-4872-b7aa-01195b28095a	2025-05-22 14:18:52.851	2025-05-29 14:18:52.851
704	709	b22c7848-c082-4c40-8ba2-7746cdab2b30	2025-05-22 14:18:52.863	2025-05-29 14:18:52.863
705	710	bbb2111b-6e31-45e2-831f-b6d1d71b5a22	2025-05-22 14:18:52.921	2025-05-29 14:18:52.921
706	711	389b2a9f-65de-49b2-bd35-751cdd1a3858	2025-05-22 14:18:52.97	2025-05-29 14:18:52.97
707	712	2adec655-ce83-48fb-9b57-64ce5c9e81a4	2025-05-22 14:18:53.023	2025-05-29 14:18:53.023
708	713	1b95dbcd-0ebc-46ec-b636-a716c9f98ec7	2025-05-22 14:18:53.103	2025-05-29 14:18:53.103
709	715	cf04d47b-5e36-4ffd-a5f6-80467911adf3	2025-05-22 14:18:53.103	2025-05-29 14:18:53.103
710	714	e61e06ea-ec1b-4d49-93ca-730c9944acb5	2025-05-22 14:18:53.102	2025-05-29 14:18:53.102
711	716	8dd34d5a-93c8-4fe7-b331-b5330190bdc2	2025-05-22 14:18:53.162	2025-05-29 14:18:53.162
712	717	d2491440-0199-4458-ba8e-0297c98ff8a9	2025-05-22 14:18:53.264	2025-05-29 14:18:53.264
713	718	e8bb4a1a-a982-48ff-8dc7-2cbe4b30e7b4	2025-05-22 14:18:53.426	2025-05-29 14:18:53.426
714	719	a0987e0c-bc0e-4ff5-9b91-f14b83cf93af	2025-05-22 14:18:53.427	2025-05-29 14:18:53.427
715	720	79b502f6-1741-46a6-bec6-de1803c53c03	2025-05-22 14:18:53.514	2025-05-29 14:18:53.514
716	721	530f8733-3a84-4345-95db-0c7eca1e9b97	2025-05-22 14:18:53.681	2025-05-29 14:18:53.681
717	722	40f701ed-e70e-41d6-81b0-d7e50d84f35d	2025-05-22 14:18:53.902	2025-05-29 14:18:53.902
718	723	72be1a39-4883-4d49-96dc-5b7225bff279	2025-05-22 14:18:53.993	2025-05-29 14:18:53.993
719	724	f1ca4867-7b0a-4bf4-9fb5-ea9999bd5bb4	2025-05-22 14:18:54.415	2025-05-29 14:18:54.415
720	725	ed0d198f-b484-41d1-b5ec-9c90b9769e4e	2025-05-22 14:18:54.617	2025-05-29 14:18:54.617
721	726	4eda86c7-dd59-4bb3-8da5-515e62e51a0c	2025-05-22 14:18:54.672	2025-05-29 14:18:54.672
722	727	fbd02bae-d898-441b-abaf-934163db89d5	2025-05-22 14:18:54.672	2025-05-29 14:18:54.672
723	728	78c5cb7f-bb48-4c2e-9c14-a395d2e654a6	2025-05-22 14:18:54.683	2025-05-29 14:18:54.683
724	729	e56a6737-c749-442d-95ee-06acd30fdd33	2025-05-22 14:18:54.684	2025-05-29 14:18:54.683
725	730	ca8d214d-e537-4947-9a3b-b52b8ad6df85	2025-05-22 14:18:54.822	2025-05-29 14:18:54.822
726	731	91157cda-ee7c-47ba-b944-933b7b591519	2025-05-22 14:18:54.832	2025-05-29 14:18:54.832
727	732	d1243f02-ad3a-458c-98e9-8c52716b2d0f	2025-05-22 14:18:54.832	2025-05-29 14:18:54.832
728	733	b19ab790-7929-4587-a4d8-a6b91aa9a3bc	2025-05-22 14:18:54.852	2025-05-29 14:18:54.852
729	734	7fa0c8f9-c5fb-40df-8a6c-08760fbe32c2	2025-05-22 14:18:54.941	2025-05-29 14:18:54.941
730	737	0bfc59ec-a291-45ed-b90c-a88d1497f5f7	2025-05-22 14:18:54.977	2025-05-29 14:18:54.977
731	735	db4a671f-b3e5-40c9-b61e-a86c0331272d	2025-05-22 14:18:54.97	2025-05-29 14:18:54.97
732	736	f96e89b3-c80e-4ece-bc9e-16fea35458c9	2025-05-22 14:18:54.976	2025-05-29 14:18:54.976
733	738	08736811-5ccb-48ff-9d05-14a01a06ab4e	2025-05-22 14:18:55.147	2025-05-29 14:18:55.147
734	740	6dcc2601-e14f-4fbb-934a-69519f980920	2025-05-22 14:18:55.209	2025-05-29 14:18:55.209
735	739	14b2947e-9f9a-46dc-98b9-3fd44e6fa64a	2025-05-22 14:18:55.208	2025-05-29 14:18:55.208
736	741	07587424-14d9-4a02-b5ff-2cd2fd7890e6	2025-05-22 14:18:55.219	2025-05-29 14:18:55.219
737	742	64535240-d686-43d0-9cff-d62ed2993443	2025-05-22 14:18:55.342	2025-05-29 14:18:55.342
738	743	1b532ee6-c9cf-4303-a080-f3685ed959a1	2025-05-22 14:18:55.418	2025-05-29 14:18:55.418
739	744	2e7fe598-b2cb-49b1-bdd5-2813f43983be	2025-05-22 14:18:55.429	2025-05-29 14:18:55.429
740	745	ef309239-56ee-4bd0-8cc4-9516fcd2621a	2025-05-22 14:18:55.491	2025-05-29 14:18:55.491
741	746	b03bd1ce-e78e-4b4c-a129-4bf46a9f8071	2025-05-22 14:18:55.727	2025-05-29 14:18:55.727
742	747	515b87eb-0e93-483c-a27d-cd57ce6ea48f	2025-05-22 14:18:55.739	2025-05-29 14:18:55.739
743	748	47c113af-75ce-4851-bef9-d696be99d2c3	2025-05-22 14:18:55.867	2025-05-29 14:18:55.867
744	749	ac6866c9-8126-46f9-bf4e-cc3efb6541e0	2025-05-22 14:18:55.9	2025-05-29 14:18:55.9
745	750	576dac75-2dc1-432b-8185-e8f13b3f1b7b	2025-05-22 14:18:56.025	2025-05-29 14:18:56.025
746	751	121aaa93-c7c8-493f-bf24-42cc34c373a5	2025-05-22 14:18:56.035	2025-05-29 14:18:56.035
747	752	02355d7f-7a96-4df9-8e71-1fa98c88b66d	2025-05-22 14:18:56.049	2025-05-29 14:18:56.049
748	753	de77a0c2-d2d9-4093-b695-31cc2c1a2ffc	2025-05-22 14:18:56.053	2025-05-29 14:18:56.053
749	754	7d92fe6f-91bc-4600-b5a6-b06ceb95d972	2025-05-22 14:18:56.159	2025-05-29 14:18:56.159
750	755	4cc21b33-4430-4b2f-bb1c-2ea195a8e146	2025-05-22 14:18:56.45	2025-05-29 14:18:56.45
758	763	7dc5a7fc-f713-446c-88a9-7298142d3fb7	2025-05-22 14:18:57.508	2025-05-29 14:18:57.508
761	765	42408a34-1dea-4adf-9207-9becb244f80c	2025-05-22 14:18:57.722	2025-05-29 14:18:57.722
766	771	28fde823-9df4-4d56-9aea-35ae77c1711b	2025-05-22 14:18:57.826	2025-05-29 14:18:57.826
770	775	b3205eb7-65ed-4fc6-a4b4-eda37ae212b9	2025-05-22 14:18:57.875	2025-05-29 14:18:57.875
772	776	67812e1d-9777-40de-b9f7-0c992f88eccf	2025-05-22 14:18:57.939	2025-05-29 14:18:57.939
782	787	2d6b3865-0c09-4ea5-83fc-427cce417e4d	2025-05-22 14:18:58.092	2025-05-29 14:18:58.092
751	756	4f4a4a1f-ff38-4c28-ae80-ff001741a16e	2025-05-22 14:18:56.631	2025-05-29 14:18:56.631
759	764	948452a6-8f8e-422c-8a09-9cd3a6651100	2025-05-22 14:18:57.511	2025-05-29 14:18:57.511
760	766	dab89778-e6c0-45c2-8b47-79039cac00ba	2025-05-22 14:18:57.723	2025-05-29 14:18:57.723
781	786	32b61533-6e86-4cb3-a36c-1a16af1fda08	2025-05-22 14:18:58.087	2025-05-29 14:18:58.087
752	757	8fedbed5-a8f9-439e-b39b-5219e17561f5	2025-05-22 14:18:57.202	2025-05-29 14:18:57.202
755	759	b5310f15-3681-4dbd-b595-a7629116a5a7	2025-05-22 14:18:57.388	2025-05-29 14:18:57.388
757	761	7d4cd3b7-b009-400c-bb72-53c7f516f1ba	2025-05-22 14:18:57.5	2025-05-29 14:18:57.5
762	767	2c382708-0f4e-4298-a8e3-b2b470931617	2025-05-22 14:18:57.727	2025-05-29 14:18:57.727
768	773	2038422d-e070-4a2d-8d65-4a827889b082	2025-05-22 14:18:57.842	2025-05-29 14:18:57.842
773	778	853347dc-4754-41c6-9cfd-56030577909b	2025-05-22 14:18:57.949	2025-05-29 14:18:57.949
780	785	063ee5db-872a-48ff-8705-b71e5d1c3360	2025-05-22 14:18:58.066	2025-05-29 14:18:58.066
753	758	3063dfbe-284c-426c-afc3-0f530fce4f46	2025-05-22 14:18:57.271	2025-05-29 14:18:57.271
763	768	6e9c538e-41fc-40d1-8bc8-8157a1c2d5c5	2025-05-22 14:18:57.736	2025-05-29 14:18:57.736
767	772	2feb3ae8-1c18-4abb-8cdb-3f8c705e0aba	2025-05-22 14:18:57.828	2025-05-29 14:18:57.828
769	774	81346818-56ad-496e-a536-61b7bcfe8785	2025-05-22 14:18:57.868	2025-05-29 14:18:57.868
771	777	92e0d918-fbe1-4aa2-858d-22f54fc6cdc9	2025-05-22 14:18:57.939	2025-05-29 14:18:57.939
754	760	ba8a2ccd-f11c-4088-81dd-b85b013d66f2	2025-05-22 14:18:57.387	2025-05-29 14:18:57.387
756	762	1a69cd95-7191-46e1-886a-52932230dce9	2025-05-22 14:18:57.5	2025-05-29 14:18:57.5
764	769	a3550426-378f-49bd-ac32-c8fa935ec562	2025-05-22 14:18:57.737	2025-05-29 14:18:57.737
765	770	d77fbc11-9cfd-4c8b-94a4-26ec9c936cf3	2025-05-22 14:18:57.826	2025-05-29 14:18:57.826
774	779	820c9a12-4887-48a7-8f50-a4d1523970b4	2025-05-22 14:18:57.955	2025-05-29 14:18:57.955
777	784	285b4ed8-d9f7-4123-b7e0-4753050b255b	2025-05-22 14:18:58.05	2025-05-29 14:18:58.05
775	780	6d668cdd-7c3f-4a08-83a0-96db3e469989	2025-05-22 14:18:57.972	2025-05-29 14:18:57.972
779	783	ceace512-fbfe-43bf-8185-1286029f040c	2025-05-22 14:18:58.051	2025-05-29 14:18:58.051
783	788	ceba08fc-fab9-4c2e-94f4-584106f2833b	2025-05-22 14:18:58.151	2025-05-29 14:18:58.151
776	781	6a55ce5e-fb94-42da-b9a3-76d4dfa7ff96	2025-05-22 14:18:57.977	2025-05-29 14:18:57.977
778	782	7f1b5fed-e267-4ff1-a844-0310f40cc485	2025-05-22 14:18:58.047	2025-05-29 14:18:58.047
784	789	0b863e15-3f93-41f6-800b-a724ee63995d	2025-05-22 16:08:38.734	2025-05-29 16:08:38.734
785	790	204df42d-3478-4a88-a31e-2a0929b60eda	2025-05-22 17:01:54.867	2025-05-29 17:01:54.867
786	791	c90bee66-c746-4e8a-8360-39014eaf6c14	2025-05-22 18:11:14.516	2025-05-29 18:11:14.516
787	792	6892df68-2968-4792-9b17-61136d7c1559	2025-05-22 19:04:28.967	2025-05-29 19:04:28.967
788	793	50c80573-0d0a-404a-ba78-cedb5ddde78e	2025-05-22 19:04:38.079	2025-05-29 19:04:38.079
789	794	1c3abe95-9e74-4d6b-9349-038902c18eab	2025-05-22 19:06:11.879	2025-05-29 19:06:11.879
790	795	a78759d2-910e-4e08-b8ea-42a054bec306	2025-05-22 20:00:25.304	2025-05-29 20:00:25.304
791	796	61daba7d-3b44-4a50-9cbf-83ae9aae232a	2025-05-22 22:41:52.805	2025-05-29 22:41:52.805
792	797	4a7e3153-5e01-4393-9377-a47f52d636de	2025-05-23 01:52:20.262	2025-05-30 01:52:20.262
793	798	506d5714-6f64-46ee-82e5-f6df41ee4cad	2025-05-23 02:00:14.542	2025-05-30 02:00:14.542
794	799	89266e58-60e2-45f0-8b2e-b6dbffc4a3d7	2025-05-23 03:38:53.014	2025-05-30 03:38:53.014
795	800	0689c39a-066d-46e7-b7e0-d01529b0a77a	2025-05-23 03:52:49.006	2025-05-30 03:52:49.006
796	801	ddade7cd-062d-4770-8517-405ab5781d97	2025-05-23 04:24:31.704	2025-05-30 04:24:31.704
797	802	69f27e5e-72fd-4226-9bc1-682c75f6b085	2025-05-23 04:25:28.312	2025-05-30 04:25:28.312
798	803	ac9ddf1c-1096-4ced-b3fe-848fed9715c4	2025-05-23 04:29:24.088	2025-05-30 04:29:24.088
799	804	a939aadf-6781-48c4-985e-807bc2e8ae76	2025-05-23 04:39:17.069	2025-05-30 04:39:17.069
800	805	9711aa8b-727f-44d2-95c0-75a2e74238b6	2025-05-23 04:40:19.443	2025-05-30 04:40:19.443
801	806	8df74d3c-ae0e-477a-8dde-1ab61ad85143	2025-05-23 04:48:08.362	2025-05-30 04:48:08.362
802	807	f7e11b72-d228-4ed9-ab81-5325a10d031e	2025-05-23 04:50:50.523	2025-05-30 04:50:50.523
803	808	022365bf-26c2-451a-8c6b-16d63aa5f5ca	2025-05-23 04:50:51.249	2025-05-30 04:50:51.249
804	809	0d2115a9-edee-46ae-9996-ae0a2125783c	2025-05-23 05:00:45.046	2025-05-30 05:00:45.046
805	810	5b62a61a-881d-4b1c-9ff2-d845cab33893	2025-05-23 05:18:41.634	2025-05-30 05:18:41.634
806	811	36899e25-192e-4734-99cb-d92ce6763704	2025-05-23 05:18:51.595	2025-05-30 05:18:51.595
807	812	1cac8bb2-3283-4162-9f78-8300bc9a3e39	2025-05-23 05:20:09.545	2025-05-30 05:20:09.545
808	813	46210f31-96ca-4abc-bb6d-e7bb4b745dba	2025-05-23 05:30:22.995	2025-05-30 05:30:22.995
809	814	c1031421-d6a8-4997-b1d2-69c187fdc3f7	2025-05-23 06:07:05.174	2025-05-30 06:07:05.174
810	815	914d7f9f-2c40-4076-b55c-32138882b240	2025-05-23 06:12:59.572	2025-05-30 06:12:59.572
811	816	1840807b-683a-4554-8b87-50d3894f8bda	2025-05-23 06:38:20.905	2025-05-30 06:38:20.905
812	817	2e0c7d9b-63e8-4514-8aec-d0fd8cb9dcc3	2025-05-23 07:14:01.48	2025-05-30 07:14:01.48
813	818	57fe2b53-0cda-4ada-bc58-bc8b5b4018d0	2025-05-23 07:50:44.72	2025-05-30 07:50:44.72
814	819	b2b4e6a9-c7b6-466d-a1f1-76468375f5b4	2025-05-23 07:50:44.722	2025-05-30 07:50:44.722
815	820	b3d15479-8c6e-4227-ad86-5bdffd1573a6	2025-05-23 07:50:44.771	2025-05-30 07:50:44.771
816	821	ae29f145-2cc4-4046-a60c-df69de8a99dd	2025-05-23 07:50:46.088	2025-05-30 07:50:46.088
817	822	4ae86d41-8180-4661-b3ea-5869db0b391d	2025-05-23 08:21:44.413	2025-05-30 08:21:44.413
818	823	e4c0fca2-63a5-46db-86ef-33afa675bc1f	2025-05-23 08:28:01.651	2025-05-30 08:28:01.651
819	825	049d1b57-76d6-49bb-9090-42aab29694a6	2025-05-23 08:28:01.65	2025-05-30 08:28:01.65
820	824	7b5e061b-85aa-4f6e-b49c-9f38753ab234	2025-05-23 08:28:01.651	2025-05-30 08:28:01.651
821	826	342a8472-846d-43c6-a2b1-889719a937f2	2025-05-23 08:28:01.771	2025-05-30 08:28:01.771
822	827	d3bcab6a-dcb8-463f-8abd-769502a77b80	2025-05-23 08:28:01.788	2025-05-30 08:28:01.788
823	828	7ab678c4-0b34-4743-a6c1-8acbb53b91d6	2025-05-23 08:28:02.582	2025-05-30 08:28:02.582
824	829	9be51590-0886-4e12-87e7-b1c99a4c6657	2025-05-23 11:16:19.055	2025-05-30 11:16:19.055
826	831	84847353-98df-4d6a-a94e-d15900d71afc	2025-05-23 13:34:14.687	2025-05-30 13:34:14.687
825	830	4acc91b6-bd37-4c36-9462-3cbbac9440f2	2025-05-23 13:34:14.689	2025-05-30 13:34:14.689
827	832	5a64a3a5-379d-41aa-97b3-9d81f6da3df1	2025-05-23 13:44:57.724	2025-05-30 13:44:57.724
828	833	12869a72-e4e9-4706-bedf-6f50dc1c694c	2025-05-23 13:57:33.086	2025-05-30 13:57:33.086
829	834	b1928314-4f18-4408-af66-740f1585c408	2025-05-23 14:49:42.515	2025-05-30 14:49:42.515
830	835	9f9291a9-48fb-4494-95b4-de0235fdb0e1	2025-05-23 14:52:02.795	2025-05-30 14:52:02.795
831	836	5013a32a-30af-432c-afaa-20a2bec6f95f	2025-05-23 14:52:32.835	2025-05-30 14:52:32.835
833	841	e4941197-b527-45b5-b486-a3f4659658fb	2025-05-23 14:58:24.693	2025-05-30 14:58:24.693
832	843	949dd12e-0593-420d-944d-86b8df11ac42	2025-05-23 14:58:24.683	2025-05-30 14:58:24.683
834	840	704983fb-fa19-47b3-b64d-0fab19607f93	2025-05-23 14:58:24.681	2025-05-30 14:58:24.681
835	844	4efe39eb-cdd4-4be2-a219-dd340511c613	2025-05-23 14:58:24.695	2025-05-30 14:58:24.695
836	839	2d375727-45dd-4166-b3a3-10ea51ddf44a	2025-05-23 14:58:24.695	2025-05-30 14:58:24.695
837	842	68385679-159b-45f3-8765-a795e8a737df	2025-05-23 14:58:24.696	2025-05-30 14:58:24.696
838	838	13edb050-2e60-475c-86f6-b5fc2b5c8ebf	2025-05-23 14:58:24.696	2025-05-30 14:58:24.696
839	847	a6904c64-eab0-4049-9a46-2cfe03b830d2	2025-05-23 14:58:24.729	2025-05-30 14:58:24.729
840	845	fdd5a121-1083-4a7a-b99b-c19d36107867	2025-05-23 14:58:24.697	2025-05-30 14:58:24.697
841	837	62ed253b-59bc-4a1a-97fc-43c54008f497	2025-05-23 14:58:24.724	2025-05-30 14:58:24.724
842	849	25021681-98c3-4055-b486-e427f0251763	2025-05-23 14:58:24.754	2025-05-30 14:58:24.754
843	846	4b5e01db-2193-47b9-bf09-ba185db8649e	2025-05-23 14:58:24.736	2025-05-30 14:58:24.736
844	851	1b4cb705-124f-456d-ba66-5a3656c2fee2	2025-05-23 14:58:24.755	2025-05-30 14:58:24.755
845	848	3c4e78c3-d789-4086-b557-669e719c174f	2025-05-23 14:58:24.733	2025-05-30 14:58:24.733
846	850	9749d846-5f3e-44b7-94de-cbfe19fa3bf2	2025-05-23 14:58:24.755	2025-05-30 14:58:24.755
847	852	ff3f7ed6-1341-49f0-b836-dba8e9217abc	2025-05-23 15:16:39.519	2025-05-30 15:16:39.519
848	853	716a0af7-6652-4f58-90f5-86cb1acab014	2025-05-23 15:16:39.79	2025-05-30 15:16:39.79
849	854	3aafb90b-afda-4cd3-a033-ba6ad123deef	2025-05-23 15:16:40.045	2025-05-30 15:16:40.045
850	855	dca05001-b4f7-4107-b6be-7f00e33eca87	2025-05-23 15:16:40.977	2025-05-30 15:16:40.977
851	856	337c47df-22be-457e-8933-f2d69dd50885	2025-05-23 15:16:41.233	2025-05-30 15:16:41.233
852	857	4574a105-98d2-4aa6-8a9b-e749745b17c7	2025-05-23 15:16:58.184	2025-05-30 15:16:58.184
853	858	4b9ea815-8827-4f39-a094-c8682b6cfa27	2025-05-23 15:16:58.402	2025-05-30 15:16:58.402
854	859	7ea7a038-00c9-4c84-904c-3eefd726a73b	2025-05-23 15:16:58.561	2025-05-30 15:16:58.561
855	860	301d8eb4-274e-495a-a189-5dea96c9813a	2025-05-23 15:16:59.65	2025-05-30 15:16:59.65
856	861	02386529-0d6c-4352-ad27-cffa8964b06c	2025-05-23 15:16:59.866	2025-05-30 15:16:59.866
857	862	b6f88fbe-f432-458a-84a7-89760adbc068	2025-05-23 15:22:41.332	2025-05-30 15:22:41.332
858	863	0b690f32-cb6d-4686-89d5-92b1b8df2851	2025-05-23 16:25:25.203	2025-05-30 16:25:25.202
859	864	425ce7ce-5a35-4a71-aa6a-f5eb984bbbc3	2025-05-23 16:32:02.55	2025-05-30 16:32:02.55
860	865	744eeaeb-cbe0-4186-a50a-6f67e273c703	2025-05-23 16:33:06.474	2025-05-30 16:33:06.474
861	866	80835ae0-5663-4afa-bd3a-b25fa8ab588b	2025-05-23 16:33:22.107	2025-05-30 16:33:22.107
862	867	c7cfcdcd-6e2a-4226-aa8a-343ec0ed2753	2025-05-23 16:33:28.892	2025-05-30 16:33:28.892
863	868	b165c306-478e-485d-9ca9-73f78275c62f	2025-05-23 16:34:37.773	2025-05-30 16:34:37.773
864	869	385925fd-f418-405d-9143-add866f8c27c	2025-05-23 16:37:40.294	2025-05-30 16:37:40.294
865	870	8e727335-a2b0-4367-9fc5-53458b0da689	2025-05-23 17:02:30.986	2025-05-30 17:02:30.986
866	871	b09bc33a-63bd-44a4-9879-b0be161f3092	2025-05-23 17:02:31.375	2025-05-30 17:02:31.374
867	872	de0d0040-0eaf-4825-a2bb-1b9e6afc06a9	2025-05-23 17:02:31.41	2025-05-30 17:02:31.41
868	873	5ccecc2c-84d0-4bcd-a4dc-c286979505b9	2025-05-23 17:02:31.576	2025-05-30 17:02:31.576
869	874	707ba2f1-ccf5-4d3c-83b4-d54e7f3ec810	2025-05-23 17:02:31.757	2025-05-30 17:02:31.757
870	875	cea16804-93ed-4cc4-9623-d221cc2e684d	2025-05-23 17:02:32.373	2025-05-30 17:02:32.373
874	879	9c1f0871-b468-45da-a068-e7e9c3badad4	2025-05-23 17:02:32.511	2025-05-30 17:02:32.511
871	877	15a4c49c-2853-40b9-8fe9-54d9778f1832	2025-05-23 17:02:32.402	2025-05-30 17:02:32.402
876	882	0c3db3c2-e8c8-4357-b79d-a1b319ff7791	2025-05-23 17:02:32.762	2025-05-30 17:02:32.762
885	890	b2ffb5dc-6408-44e2-9aac-2a151a542d04	2025-05-23 17:02:33.036	2025-05-30 17:02:33.036
891	896	5e6a49d8-5273-48c6-8d43-394be6d72e1c	2025-05-23 17:02:33.203	2025-05-30 17:02:33.203
895	900	7ce3cd50-bb16-448e-a986-4788abca28b1	2025-05-23 17:02:33.277	2025-05-30 17:02:33.277
898	904	aaf67501-deb8-48c0-9868-3e7dd19f90df	2025-05-23 17:02:33.396	2025-05-30 17:02:33.396
872	876	31b799f8-28ea-4e11-be58-cb284f1929ea	2025-05-23 17:02:32.402	2025-05-30 17:02:32.402
873	878	79cd1d0e-664d-4518-83ce-29b6ff3f5cf2	2025-05-23 17:02:32.471	2025-05-30 17:02:32.471
875	880	5d90627b-e421-4e22-845c-1ca451ac4023	2025-05-23 17:02:32.569	2025-05-30 17:02:32.569
877	883	cb2a9ecc-036a-476b-a41d-8074cdfed0e3	2025-05-23 17:02:32.763	2025-05-30 17:02:32.763
878	881	fb8a6d2a-39ab-461c-bef8-487b5b99f85e	2025-05-23 17:02:32.761	2025-05-30 17:02:32.761
879	884	f890becf-a9c0-4b6b-8821-88b9962806ea	2025-05-23 17:02:32.826	2025-05-30 17:02:32.826
880	885	7c0f4a00-b166-4057-bbd3-a0026decdd9a	2025-05-23 17:02:32.849	2025-05-30 17:02:32.849
881	886	88d496e8-e476-4b71-89ee-4880609c6afa	2025-05-23 17:02:32.863	2025-05-30 17:02:32.863
882	887	28c7c7d4-be1b-496a-8617-710e057967b0	2025-05-23 17:02:32.883	2025-05-30 17:02:32.883
883	888	76d8a53f-84d9-4838-8955-9a98e0c075d8	2025-05-23 17:02:32.919	2025-05-30 17:02:32.919
884	889	13d4e025-c79b-43b3-8b64-1785575f0c35	2025-05-23 17:02:32.954	2025-05-30 17:02:32.953
886	891	05ea7ad4-0d33-4157-8e36-594e44094865	2025-05-23 17:02:33.04	2025-05-30 17:02:33.04
887	893	67f6a6a9-9409-40e4-b229-819c8b01870d	2025-05-23 17:02:33.047	2025-05-30 17:02:33.047
888	892	acf44cd9-c7cb-4d23-bd04-dde858193748	2025-05-23 17:02:33.045	2025-05-30 17:02:33.045
889	894	6163e5f4-e45d-4fa0-84dc-26d6a1f1da33	2025-05-23 17:02:33.077	2025-05-30 17:02:33.077
890	895	53e6e94f-ed9d-4dd1-adc7-3e86204d6d54	2025-05-23 17:02:33.132	2025-05-30 17:02:33.132
892	897	70c58455-dba1-491e-b34b-a1758db2a62b	2025-05-23 17:02:33.206	2025-05-30 17:02:33.206
893	899	44d95e62-317a-4e16-952e-754cb21faaa1	2025-05-23 17:02:33.21	2025-05-30 17:02:33.21
894	898	c91f1723-ebc8-4fd1-9a0c-6d989d90361f	2025-05-23 17:02:33.212	2025-05-30 17:02:33.212
896	901	db965366-fc86-4659-9281-27d5d0108e1b	2025-05-23 17:02:33.31	2025-05-30 17:02:33.31
897	902	e7bacdca-0269-47be-aeed-faf2bb625a08	2025-05-23 17:02:33.382	2025-05-30 17:02:33.382
899	903	9797dcd2-179d-4cd4-b186-88f7f7c486ee	2025-05-23 17:02:33.396	2025-05-30 17:02:33.396
900	905	7ac3ef70-9966-4518-9ddb-06a661476f37	2025-05-23 17:02:33.397	2025-05-30 17:02:33.397
901	906	043483a0-c8be-4949-8af5-591e92731e40	2025-05-23 17:02:33.423	2025-05-30 17:02:33.423
902	908	2ccf3717-3920-4a61-ae41-c68f773ab585	2025-05-23 17:02:33.503	2025-05-30 17:02:33.503
903	907	19de4857-c525-44d3-90f5-88f53fa39d85	2025-05-23 17:02:33.503	2025-05-30 17:02:33.503
904	909	826b1951-3c3a-40cf-890f-eaf3610ba2bf	2025-05-23 17:02:33.504	2025-05-30 17:02:33.504
905	910	82856645-680c-40b4-a2c1-7f64983b2696	2025-05-23 17:02:33.518	2025-05-30 17:02:33.518
906	911	a9589baf-cc3d-4f12-8f5c-06e2b351f809	2025-05-23 17:02:33.579	2025-05-30 17:02:33.579
907	912	b8026279-cb42-4c3d-af9c-c4e47961f82f	2025-05-23 17:02:33.582	2025-05-30 17:02:33.582
908	913	204b492c-575f-4ad3-9f23-9c20592a965b	2025-05-23 17:02:33.613	2025-05-30 17:02:33.613
909	914	acd6d010-d916-4a5d-96ae-f942226adb73	2025-05-23 17:02:33.617	2025-05-30 17:02:33.617
910	915	631ede5a-871f-4025-a337-920e0d100358	2025-05-23 17:02:33.623	2025-05-30 17:02:33.623
911	916	c937ba69-8bee-44a0-9d64-169703d806c6	2025-05-23 17:04:42.138	2025-05-30 17:04:42.138
912	917	71024547-49a0-4f78-9edc-9aad15825008	2025-05-23 17:08:51.286	2025-05-30 17:08:51.286
913	918	83b98d07-aa76-418a-8b69-e6f4beab0871	2025-05-23 17:08:51.768	2025-05-30 17:08:51.767
914	919	161470a7-4c89-4ba1-a432-fd2169622eb1	2025-05-23 17:41:06.762	2025-05-30 17:41:06.762
915	920	3629a246-d2d5-40e8-b778-4a7a2b358062	2025-05-23 17:41:14.598	2025-05-30 17:41:14.598
916	921	973c6ff3-b276-40e0-b5dd-9ee0c6d6352f	2025-05-23 17:49:26.391	2025-05-30 17:49:26.391
917	922	f76f38e8-cf6d-4be3-89c9-6545368f8c12	2025-05-23 17:51:12.606	2025-05-30 17:51:12.606
918	923	c9144789-cb46-40ef-996d-62d2da77b87d	2025-05-23 17:51:49.981	2025-05-30 17:51:49.981
919	925	ef38d6f7-1bc8-4144-b672-b46a55a49ce7	2025-05-23 18:27:19.96	2025-05-30 18:27:19.96
921	927	ca7fbe5e-7b61-4060-a0ac-d9595dd2310f	2025-05-23 18:27:19.962	2025-05-30 18:27:19.962
920	924	000c0402-6b3f-4741-ba07-9a7acd656162	2025-05-23 18:27:19.961	2025-05-30 18:27:19.961
922	926	5ef018d5-52e2-4880-b4a7-007ca6b2b95c	2025-05-23 18:27:19.964	2025-05-30 18:27:19.964
923	928	1624cd26-a041-4482-9300-508195a92bec	2025-05-23 19:00:42.538	2025-05-30 19:00:42.538
924	929	224ed696-3edf-4a93-89ed-d121b7fd805e	2025-05-23 19:00:43.144	2025-05-30 19:00:43.144
925	930	1ed784af-7865-4c14-9832-b67d77722228	2025-05-23 20:00:59.678	2025-05-30 20:00:59.678
926	931	34f636f5-1b16-425b-954c-00707f5a2f47	2025-05-23 20:01:03.304	2025-05-30 20:01:03.304
927	932	0dc4cc8a-adba-437f-b6ff-06f5768f74b4	2025-05-23 20:01:08.109	2025-05-30 20:01:08.109
928	933	597eba3e-3b50-4b05-8e24-8c5ed4b8d9a4	2025-05-23 20:01:12.446	2025-05-30 20:01:12.446
929	934	86d8142f-4f73-4f87-8b3d-c5e4189f80d4	2025-05-23 20:01:16.232	2025-05-30 20:01:16.232
930	935	5e306859-b165-4548-8f61-a126850fd178	2025-05-23 20:01:18.824	2025-05-30 20:01:18.824
931	936	75b7537a-cd79-4d37-a803-6b4f7eb30e82	2025-05-23 20:01:21.508	2025-05-30 20:01:21.508
932	937	6a0c4f9c-a8e2-4212-9add-2c83f9bec241	2025-05-23 20:01:25.17	2025-05-30 20:01:25.17
933	938	9d8a0950-9a53-40f9-8c75-72e58771a2cf	2025-05-23 20:01:28.799	2025-05-30 20:01:28.799
934	939	2aaa990e-5170-4759-9baa-d79fc5ff3c6c	2025-05-23 23:30:42.728	2025-05-30 23:30:42.728
935	940	7e9a09a5-de79-4590-a8a3-9e863264750b	2025-05-23 23:31:08.859	2025-05-30 23:31:08.859
936	941	5361d520-0da0-4099-bfb1-7fe7b986bb6a	2025-05-23 23:31:08.902	2025-05-30 23:31:08.902
937	942	899211c4-b9a6-4603-a4fd-53ea09738f97	2025-05-23 23:37:06.489	2025-05-30 23:37:06.489
938	943	30902664-0442-4a19-adc5-3ee3dfa3400e	2025-05-23 23:42:28.278	2025-05-30 23:42:28.278
939	944	ae3c81aa-c8e7-482c-9693-6bd2e1940b73	2025-05-23 23:43:01.231	2025-05-30 23:43:01.231
940	945	10ac57a3-bdca-4838-a236-d0b18dc071ab	2025-05-23 23:43:01.275	2025-05-30 23:43:01.275
941	946	7f6515c5-2656-4a30-b84e-717f3d720c5f	2025-05-24 00:18:33.407	2025-05-31 00:18:33.407
942	947	54e6e8ac-4d3e-4075-a0d2-718a2c324482	2025-05-24 00:19:06.252	2025-05-31 00:19:06.252
943	948	0e77a5e4-bb2f-4e64-9190-662bcf6d40a1	2025-05-24 00:19:06.459	2025-05-31 00:19:06.459
944	949	8f402665-1732-4813-a52e-21c4d446e8b2	2025-05-24 01:07:15.835	2025-05-31 01:07:15.835
945	950	7103e58f-a7b7-4d7c-93b8-29e9d791c13e	2025-05-24 01:07:15.835	2025-05-31 01:07:15.835
946	951	4ba668d9-d5d8-441f-bc4e-9e913d915f1a	2025-05-24 02:26:15.054	2025-05-31 02:26:15.054
947	952	612edfe7-e0d4-4a12-9c92-becdaedab615	2025-05-24 03:14:41.286	2025-05-31 03:14:41.286
948	953	f25b3e15-5111-4e44-bf2e-a9fe66d2ff72	2025-05-24 04:30:44.251	2025-05-31 04:30:44.251
949	954	f7b18161-ed75-403c-8940-30053cc3e379	2025-05-24 05:36:32.958	2025-05-31 05:36:32.958
950	955	432fecd8-572f-46d5-9b25-fe79a6280b5e	2025-05-24 05:48:42.928	2025-05-31 05:48:42.928
951	956	429a9ee6-7b45-4647-9483-90217f473577	2025-05-24 05:59:00.913	2025-05-31 05:59:00.913
952	958	055ab9e4-1daf-42a5-91f2-70f3c6bfbd30	2025-05-24 05:59:02.159	2025-05-31 05:59:02.159
953	957	14bb2ed6-4d58-44c1-ab0a-a3a4dd1532fc	2025-05-24 05:59:02.161	2025-05-31 05:59:02.161
954	959	e25ac3b7-29e6-4301-a8b3-14373562a137	2025-05-24 05:59:03.103	2025-05-31 05:59:03.103
955	960	c5ac9d4f-558a-4b73-a384-f6c93d690c18	2025-05-24 05:59:03.543	2025-05-31 05:59:03.543
956	961	16488e3b-3c83-4683-872b-ca81f193b118	2025-05-24 05:59:03.544	2025-05-31 05:59:03.544
957	962	45686b37-4e19-4c61-b3f0-01337992bfc7	2025-05-24 05:59:03.617	2025-05-31 05:59:03.617
958	963	19510e3b-af2a-4345-b90c-02fe5cef74a5	2025-05-24 05:59:03.684	2025-05-31 05:59:03.684
959	964	31821c4e-7e23-442a-9f06-1d960e0e331f	2025-05-24 05:59:03.684	2025-05-31 05:59:03.684
960	965	791291d7-2ba6-4d34-b5e8-2281650a7375	2025-05-24 05:59:03.712	2025-05-31 05:59:03.712
961	967	9ba0d0d5-3e05-4e35-9c51-1fb308c84249	2025-05-24 05:59:03.796	2025-05-31 05:59:03.796
962	966	3222a445-9321-49dc-9efe-be5330ae3057	2025-05-24 05:59:03.797	2025-05-31 05:59:03.797
963	968	5c2a0fc7-6a11-4e80-8a0d-e9493aa4db90	2025-05-24 05:59:03.798	2025-05-31 05:59:03.798
964	969	ec6b6035-a254-43c2-8326-4e06a2e3c8fc	2025-05-24 05:59:03.825	2025-05-31 05:59:03.825
965	970	ee42d82b-8fb3-47d0-b3f2-16140b40394a	2025-05-24 05:59:03.849	2025-05-31 05:59:03.849
966	971	5cef37bc-16f7-4f89-bb47-62ce7de052f8	2025-05-24 05:59:03.873	2025-05-31 05:59:03.873
976	981	bd9233e5-90fd-435a-892d-ba74beb4fe74	2025-05-24 05:59:04.039	2025-05-31 05:59:04.039
980	984	cdbaf1fe-a563-4010-b48a-5a0b107ca925	2025-05-24 05:59:04.13	2025-05-31 05:59:04.13
988	993	49fb1b47-f2bc-4388-8e43-211cbf216883	2025-05-24 05:59:04.226	2025-05-31 05:59:04.226
989	994	8a645d00-03d5-4d09-b8a7-3aba95042c65	2025-05-24 05:59:04.275	2025-05-31 05:59:04.275
992	997	c58d3ace-1c8b-4875-917c-da916b029953	2025-05-24 05:59:04.359	2025-05-31 05:59:04.359
967	972	2a0d06c6-2861-41c0-90d4-67e486640b89	2025-05-24 05:59:03.88	2025-05-31 05:59:03.88
977	982	c10feef2-dd5f-43b3-b442-45492ed604f7	2025-05-24 05:59:04.041	2025-05-31 05:59:04.041
983	988	620962b0-0d8e-4f38-9d0e-27fa02741921	2025-05-24 05:59:04.146	2025-05-31 05:59:04.146
968	973	f41b99c3-67d9-4752-a787-c493f3b6909e	2025-05-24 05:59:03.88	2025-05-31 05:59:03.88
981	987	d0450520-d52a-43fc-ba26-a032269137ab	2025-05-24 05:59:04.133	2025-05-31 05:59:04.133
986	991	5d3e4ec6-eb51-4969-97b6-5a584c9701bb	2025-05-24 05:59:04.215	2025-05-31 05:59:04.215
993	998	c5800cb3-1f82-4264-af68-e5f2b20130e2	2025-05-24 05:59:04.379	2025-05-31 05:59:04.379
969	974	f05c5d71-f91e-4777-9410-51e4d9896318	2025-05-24 05:59:03.912	2025-05-31 05:59:03.912
978	983	32c555c1-6239-4467-82b8-f7d118ae557c	2025-05-24 05:59:04.088	2025-05-31 05:59:04.088
970	975	903f0f86-e07b-4866-8e08-93617699291d	2025-05-24 05:59:03.932	2025-05-31 05:59:03.932
973	978	d4a9393b-0af9-46ea-a47f-15bd0f13cc1d	2025-05-24 05:59:03.968	2025-05-31 05:59:03.968
974	979	0bc81964-7eab-4c05-b837-6c915a478b66	2025-05-24 05:59:04.005	2025-05-31 05:59:04.005
971	976	63ce6fad-0067-4619-86fe-30aadb1b06e6	2025-05-24 05:59:03.957	2025-05-31 05:59:03.957
972	977	6f8160e3-0f01-4443-b3d2-8d1280a62c57	2025-05-24 05:59:03.957	2025-05-31 05:59:03.957
982	986	1198b9fa-54e9-4ff9-91e9-054e551f1263	2025-05-24 05:59:04.131	2025-05-31 05:59:04.131
985	990	edb8472c-dd1c-429b-9812-228736199504	2025-05-24 05:59:04.209	2025-05-31 05:59:04.209
987	992	8d7cf388-890b-4766-b9d4-b79a5ea51c31	2025-05-24 05:59:04.223	2025-05-31 05:59:04.223
990	995	0658e1a0-07cc-42a3-8035-01c650fd4fa8	2025-05-24 05:59:04.295	2025-05-31 05:59:04.295
991	996	1366924e-64cd-403a-b102-cfcc5f67a5b7	2025-05-24 05:59:04.343	2025-05-31 05:59:04.343
975	980	edcaf1ed-4982-442c-b25e-480d13ffa649	2025-05-24 05:59:04.037	2025-05-31 05:59:04.037
979	985	887b65dc-fe6f-4287-954e-756e96d596af	2025-05-24 05:59:04.13	2025-05-31 05:59:04.13
984	989	199f91ab-3ab2-4b66-a6da-1076c62c3ed6	2025-05-24 05:59:04.2	2025-05-31 05:59:04.2
994	999	e377d3f9-f432-4af0-94d8-05388d16d19b	2025-05-24 07:24:29.376	2025-05-31 07:24:29.375
995	1000	f836d3ed-5abd-4e74-aaea-59ae04cd859e	2025-05-24 07:54:28.736	2025-05-31 07:54:28.736
996	1001	128cbf2b-024e-45c8-9a9f-b1043e55812f	2025-05-24 08:24:29.371	2025-05-31 08:24:29.371
997	1002	d65100a4-054b-4543-b71e-85dc3f198b40	2025-05-24 09:15:21.768	2025-05-31 09:15:21.768
998	1003	543193e9-9030-4773-b5de-0c039a4f280e	2025-05-24 10:08:12.992	2025-05-31 10:08:12.992
999	1004	43e80a12-2f7e-4fad-b744-f962a2a4428a	2025-05-24 11:10:10.421	2025-05-31 11:10:10.421
1000	1005	13d5c53e-49d3-4879-9a87-a88dd89e9536	2025-05-24 11:10:15.746	2025-05-31 11:10:15.746
1001	1006	8ed88ea5-85ba-4e64-aa9b-a8c980c9aa8e	2025-05-24 13:54:23.387	2025-05-31 13:54:23.387
1002	1007	14d2296c-de68-49ba-a070-3def3f7c2528	2025-05-24 13:58:32.444	2025-05-31 13:58:32.444
1003	1008	5ea9529e-f169-42a0-88f9-128a7c38322f	2025-05-24 22:35:16.011	2025-05-31 22:35:16.011
1004	1009	31f8ce5b-e393-42ed-bfcb-cae234b6a7fd	2025-05-24 23:32:12.63	2025-05-31 23:32:12.63
1005	1010	8a45645e-6983-4b39-a04a-31d0a7b5723f	2025-05-24 23:32:13.053	2025-05-31 23:32:13.053
1006	1011	17b3ab8d-9fa2-419e-9840-10ac04f9ddc4	2025-05-24 23:32:13.207	2025-05-31 23:32:13.207
1007	1012	3811fdc2-b995-4628-8590-9cf890aca57a	2025-05-24 23:32:14.269	2025-05-31 23:32:14.269
1008	1013	8f5cb33c-b24c-4b16-b43f-b477de3c0dab	2025-05-24 23:32:14.513	2025-05-31 23:32:14.513
1009	1014	235c32a2-d87a-429f-a5f6-d8367c2c21ec	2025-05-25 00:25:58.971	2025-06-01 00:25:58.971
1010	1015	d0cb6b77-8cc4-4448-9c2a-c5313878ca67	2025-05-25 00:47:21.656	2025-06-01 00:47:21.656
1011	1016	0732a14b-7001-4653-a22d-faf32baae191	2025-05-25 00:47:21.718	2025-06-01 00:47:21.718
1012	1017	928f0754-9348-411b-bd2d-f711087ae5ab	2025-05-25 00:47:23.272	2025-06-01 00:47:23.272
1013	1018	b2d42113-6aaf-4aaa-b83a-f20f523cdf92	2025-05-25 00:47:23.728	2025-06-01 00:47:23.728
1014	1019	82a667c7-444f-4344-a7c7-2698c6e1e11d	2025-05-25 00:47:23.729	2025-06-01 00:47:23.729
1015	1020	11f41439-aa59-4ec7-a38b-0a1df90cfcf9	2025-05-25 00:47:24.747	2025-06-01 00:47:24.747
1016	1021	6abf5a22-4d2c-4b49-ac1f-16ff8e1c05bd	2025-05-25 00:47:24.959	2025-06-01 00:47:24.959
1017	1022	73ab9828-3851-4dfd-804f-feb908aa3eec	2025-05-25 00:47:26.571	2025-06-01 00:47:26.571
1018	1023	1c8a7d3e-9d6e-497f-afa0-aa0832c78b8b	2025-05-25 00:47:26.828	2025-06-01 00:47:26.828
1019	1024	2277c1a9-8fc6-45a4-bca0-5f6767bef76a	2025-05-25 00:47:26.829	2025-06-01 00:47:26.829
1020	1025	13dc1ac5-ab31-444c-bf7b-6c06b8d18c22	2025-05-25 00:47:26.848	2025-06-01 00:47:26.848
1021	1026	988460ca-7329-41d8-9f19-c8bfc07d24ed	2025-05-25 00:47:26.857	2025-06-01 00:47:26.857
1022	1027	4117eafe-abc9-4c55-93ec-0432e3c85f43	2025-05-25 00:47:26.904	2025-06-01 00:47:26.904
1023	1028	a38e8c73-17f5-481a-87ae-0675d455f323	2025-05-25 00:47:26.948	2025-06-01 00:47:26.948
1024	1029	0b4a9549-920b-457a-993d-95cbd9bffdb6	2025-05-25 00:47:26.951	2025-06-01 00:47:26.951
1025	1030	7187f616-34e6-4abf-a31c-55d81554c87f	2025-05-25 00:47:26.951	2025-06-01 00:47:26.951
1026	1032	ba74f673-9ea9-4199-a216-428ab744fc15	2025-05-25 00:47:26.955	2025-06-01 00:47:26.955
1027	1031	bf9a2e5f-b804-4c1e-b138-c5487e53aa34	2025-05-25 00:47:26.957	2025-06-01 00:47:26.957
1028	1033	f0841d9d-b6a0-4fb5-a216-3ca32d68220c	2025-05-25 00:47:27.003	2025-06-01 00:47:27.003
1029	1034	1372e98d-d0af-43d9-91b0-2d4f6fb63689	2025-05-25 00:47:27.03	2025-06-01 00:47:27.03
1030	1035	28a4c95b-9c57-42d8-84dc-264b60afd2ae	2025-05-25 00:47:27.04	2025-06-01 00:47:27.04
1031	1036	4f1b2e02-8fe6-484e-963e-c3e1fe638e24	2025-05-25 00:47:27.073	2025-06-01 00:47:27.073
1032	1037	27affd51-d941-4ae6-8cb6-e8d1aed9f675	2025-05-25 00:47:27.075	2025-06-01 00:47:27.075
1033	1038	d8ab1290-b00a-46b4-9245-216a8bdf6915	2025-05-25 00:47:27.076	2025-06-01 00:47:27.076
1034	1039	60f09629-7ca6-4737-9727-41074257086f	2025-05-25 00:47:27.089	2025-06-01 00:47:27.089
1035	1040	3540cb0f-536b-42b4-8b81-8a8bebf23f5d	2025-05-25 00:47:27.109	2025-06-01 00:47:27.109
1036	1041	50afe568-46ee-4716-a806-e0fb81b39ffe	2025-05-25 00:47:27.144	2025-06-01 00:47:27.144
1037	1043	9fd86b62-0a44-44b5-a646-33786eb8d16c	2025-05-25 00:47:27.152	2025-06-01 00:47:27.152
1038	1042	55d077db-4a87-4609-94bb-7c0aefe732eb	2025-05-25 00:47:27.152	2025-06-01 00:47:27.152
1039	1044	ad3f031c-68c9-495b-be20-3452093d2808	2025-05-25 00:47:27.171	2025-06-01 00:47:27.171
1040	1045	91dabefc-6e55-4b70-b6ca-1eb31cec818f	2025-05-25 00:47:27.189	2025-06-01 00:47:27.189
1041	1046	0026eea6-dabe-4ef9-b031-a410ebd3ef99	2025-05-25 00:47:27.237	2025-06-01 00:47:27.237
1042	1048	75678b83-d565-47ae-9df1-db97b074fa4b	2025-05-25 00:47:27.243	2025-06-01 00:47:27.243
1043	1049	814bcc79-182d-4d3f-8134-5ede2248716f	2025-05-25 00:47:27.243	2025-06-01 00:47:27.243
1044	1047	60e8d342-372d-4414-b715-c57ac182ba72	2025-05-25 00:47:27.242	2025-06-01 00:47:27.241
1045	1050	98e7825a-6621-4939-b901-a91c18e1c8af	2025-05-25 00:47:27.254	2025-06-01 00:47:27.254
1046	1051	3f0f43b8-0b66-4ee3-b488-7669c248d83e	2025-05-25 00:47:27.312	2025-06-01 00:47:27.312
1047	1052	d6738e8c-046e-4432-8bc6-444755b42cef	2025-05-25 00:47:27.327	2025-06-01 00:47:27.327
1048	1053	063c0fac-fa03-4233-a65b-8ecfb3d994ee	2025-05-25 00:47:27.358	2025-06-01 00:47:27.358
1049	1054	7f00138a-5fb1-4d26-8df3-12ceebb258fa	2025-05-25 00:47:27.36	2025-06-01 00:47:27.36
1050	1055	ea9cb857-83f3-413a-89ca-49c1d935e331	2025-05-25 01:01:51.721	2025-06-01 01:01:51.721
1051	1056	54d621bf-4684-4d87-9a84-5fd9820235f1	2025-05-25 01:01:53.756	2025-06-01 01:01:53.756
1052	1057	00163bce-25e4-405c-b4ae-7251157ec766	2025-05-25 01:01:54.957	2025-06-01 01:01:54.957
1053	1058	0499503e-8513-4df0-8bb7-d8c05f5b9cb2	2025-05-25 01:01:55.047	2025-06-01 01:01:55.047
1054	1059	f7feee28-e901-4720-9c8b-ae2cf51570b6	2025-05-25 01:01:55.188	2025-06-01 01:01:55.188
1055	1060	ab1998c3-b728-434e-9fff-f0fa831a075a	2025-05-25 01:01:55.215	2025-06-01 01:01:55.215
1056	1061	221da2e2-8cca-406b-b752-0e69c010c562	2025-05-25 01:01:55.213	2025-06-01 01:01:55.213
1057	1062	7f8401e7-062a-4839-956c-5d3a11b927b2	2025-05-25 01:01:55.283	2025-06-01 01:01:55.283
1058	1063	e349c703-474b-4349-ab82-f20e065e3d0d	2025-05-25 01:01:55.322	2025-06-01 01:01:55.322
1059	1064	1f0f2bcf-e6cc-4fc3-ab12-8eeacde126a5	2025-05-25 01:01:55.34	2025-06-01 01:01:55.34
1060	1065	e087190d-cb1c-4c18-ae3e-57468b0afef5	2025-05-25 01:01:55.35	2025-06-01 01:01:55.35
1061	1066	305c80d6-dea0-4781-8f6e-892c1d05443c	2025-05-25 01:01:55.392	2025-06-01 01:01:55.392
1062	1067	26d3ea9e-c6cc-4c85-bba0-502b17d47218	2025-05-25 01:01:55.395	2025-06-01 01:01:55.395
1063	1068	da89156b-5aef-4488-b226-0d3fdf24c3fc	2025-05-25 01:01:55.408	2025-06-01 01:01:55.408
1064	1069	cd303396-9641-4596-9ebf-bb83bbf2be71	2025-05-25 01:01:55.441	2025-06-01 01:01:55.441
1065	1070	147f8a2f-bf61-4680-bfa5-aae868e3f21b	2025-05-25 01:01:55.458	2025-06-01 01:01:55.458
1066	1071	6816af94-7aa9-43e6-88fe-accbc4582b3c	2025-05-25 01:01:55.483	2025-06-01 01:01:55.483
1067	1072	485a9f96-bb64-422e-8d36-b9add4ebfb9a	2025-05-25 01:01:55.484	2025-06-01 01:01:55.484
1068	1073	110c2e2c-05a3-49dd-874a-61af8dc1e007	2025-05-25 01:01:55.49	2025-06-01 01:01:55.49
1069	1074	455fa0dc-7a8c-4668-9748-98c0f7ad0906	2025-05-25 01:01:55.554	2025-06-01 01:01:55.554
1070	1075	ee7e618a-0924-4c18-9824-b90b7e375cec	2025-05-25 01:01:55.562	2025-06-01 01:01:55.562
1071	1076	f01a3a01-bc30-4c20-bc22-73cd3466f421	2025-05-25 01:01:55.599	2025-06-01 01:01:55.599
1072	1077	aa733d44-678b-40b2-963a-b4d490c94bde	2025-05-25 01:01:55.618	2025-06-01 01:01:55.618
1073	1078	9b65cd06-7eb2-4397-b564-63ddf05ccb7d	2025-05-25 01:01:55.634	2025-06-01 01:01:55.634
1074	1079	3860af2e-6e6a-471e-8868-92ca18244a50	2025-05-25 01:01:55.638	2025-06-01 01:01:55.638
1075	1080	4970ebcc-2cfb-4e19-a144-6cd73f4709c8	2025-05-25 01:01:55.666	2025-06-01 01:01:55.666
1076	1081	eee7885f-2b7d-488d-a926-e8a3b990c251	2025-05-25 01:01:55.669	2025-06-01 01:01:55.669
1077	1082	3a834b61-969b-4982-a5b4-3bd4e36e3506	2025-05-25 01:01:55.692	2025-06-01 01:01:55.692
1078	1083	25e7922a-aab6-4129-9e1e-533f2e3d9dd4	2025-05-25 01:01:55.723	2025-06-01 01:01:55.723
1079	1084	c7da4a2c-2012-42d3-93aa-f3d80b4e92d5	2025-05-25 01:01:55.729	2025-06-01 01:01:55.729
1080	1085	379d2aa2-5db8-4465-8625-814ab5cf9da2	2025-05-25 01:01:55.737	2025-06-01 01:01:55.737
1081	1086	0e8069e5-0fa0-49cb-891d-2729d4ac9d26	2025-05-25 01:01:55.75	2025-06-01 01:01:55.75
1083	1088	36a994cd-51bd-44c6-9c82-f5975bafa8dc	2025-05-25 01:01:55.824	2025-06-01 01:01:55.824
1086	1091	9efd8bdd-9a2d-4ee6-931a-afd47d94aca0	2025-05-25 01:01:55.899	2025-06-01 01:01:55.899
1089	1094	62a75b35-989e-44ae-b9e4-60b08adaa2de	2025-05-25 01:01:56.022	2025-06-01 01:01:56.022
1082	1087	be32ed2f-517c-4aab-9fac-1dcf5875688c	2025-05-25 01:01:55.812	2025-06-01 01:01:55.812
1087	1092	030e8166-7dee-4582-835f-353390f7ba3b	2025-05-25 01:01:55.917	2025-06-01 01:01:55.917
1088	1093	7449b316-adff-4c6a-be96-cb69a519d4ce	2025-05-25 01:01:56.002	2025-06-01 01:01:56.002
1084	1089	39c2898b-4799-4934-983a-6bdfe334fef7	2025-05-25 01:01:55.829	2025-06-01 01:01:55.829
1085	1090	8daf1c1f-3673-4133-b93c-b41da0b98167	2025-05-25 01:01:55.895	2025-06-01 01:01:55.895
1090	1095	3c8beae9-b125-4b1d-bc04-1687005644db	2025-05-25 01:05:55.35	2025-06-01 01:05:55.35
1091	1096	d65f46d8-33b8-4797-a9b1-fe54a612531a	2025-05-25 01:34:20.956	2025-06-01 01:34:20.956
1092	1097	07be172a-e6e4-4d67-b024-571a71aacf39	2025-05-25 01:34:58.882	2025-06-01 01:34:58.882
1093	1098	267c9344-0e38-4d82-ae9b-e2b695019e56	2025-05-25 01:34:59.15	2025-06-01 01:34:59.15
1094	1099	2ce821d3-8226-409c-846f-eba02f63a3c2	2025-05-25 01:34:59.301	2025-06-01 01:34:59.301
1095	1100	b1df273c-2429-4ec7-80b5-f145aa2e9a60	2025-05-25 01:35:01.118	2025-06-01 01:35:01.118
1096	1101	da809bb8-719d-4991-ba2f-ec39aea2d6c8	2025-05-25 01:35:01.322	2025-06-01 01:35:01.322
1097	1102	41856aec-e53b-4d53-8f11-2ebd057afb5e	2025-05-25 01:35:19.613	2025-06-01 01:35:19.613
1098	1103	031d7388-7b1a-4a33-aa05-20037b9438cc	2025-05-25 01:35:37.908	2025-06-01 01:35:37.908
1099	1104	cd2e106c-dcf1-4a21-849f-58e9eaa4314d	2025-05-25 08:38:00.481	2025-06-01 08:38:00.481
1100	1105	aa383558-b8c6-4550-be78-dfac49b898b5	2025-05-25 12:44:46.104	2025-06-01 12:44:46.104
1101	1106	dbebcf7f-e0a0-4582-a74d-42526f8f0ccd	2025-05-25 13:38:20.75	2025-06-01 13:38:20.75
1102	1107	a2e3f56a-98b4-4c7b-afb5-fb210462d16a	2025-05-25 13:38:21.486	2025-06-01 13:38:21.486
1103	1108	396f69a5-66af-4e62-8fca-72d5430869c1	2025-05-25 17:35:31.436	2025-06-01 17:35:31.436
1104	1109	4a535c49-1e74-4049-a90b-ca32f863cb16	2025-05-25 17:41:18.629	2025-06-01 17:41:18.629
1105	1110	6d784acd-df97-475a-bf61-9be2c694bea4	2025-05-25 19:33:27.39	2025-06-01 19:33:27.39
1106	1111	94d7550f-b06c-480c-9eb1-074f19885db0	2025-05-25 19:52:32.223	2025-06-01 19:52:32.223
1107	1112	edfe6f5c-fa34-43bb-a71c-90c65a5901e0	2025-05-25 19:53:24.36	2025-06-01 19:53:24.36
1108	1113	bc777497-b46c-431e-8769-9a464f738d69	2025-05-25 19:58:10.799	2025-06-01 19:58:10.799
1109	1114	4676f4c9-0d60-4aa0-9c40-427321cbb85e	2025-05-25 22:24:35.41	2025-06-01 22:24:35.41
1110	1115	e77a8138-a8cc-477b-afdc-04aa16774e89	2025-05-25 22:26:17.502	2025-06-01 22:26:17.502
1111	1116	236b0f02-77cb-44b5-ad0b-26752d0b9cd1	2025-05-25 23:05:50.993	2025-06-01 23:05:50.993
1112	1117	5f9a2e13-95e1-4592-9f1c-a0de59ebc498	2025-05-26 04:25:03.177	2025-06-02 04:25:03.177
1113	1118	fb45e115-a959-4892-82c3-cdcb02bfa079	2025-05-26 04:25:08.805	2025-06-02 04:25:08.805
1115	1119	9a53f603-1995-4302-a1a5-3da47249cde5	2025-05-26 05:14:19.929	2025-06-02 05:14:19.929
1114	1120	3da9d615-cdd5-4244-a5b3-7e94266df5e2	2025-05-26 05:14:19.928	2025-06-02 05:14:19.928
1116	1121	8f7e55a1-328f-4696-a23e-65c8bcf897c2	2025-05-26 05:14:45.349	2025-06-02 05:14:45.349
1117	1122	abaf0906-69bb-49ae-a274-f28c47197272	2025-05-26 05:15:51.886	2025-06-02 05:15:51.886
1118	1123	9b0641a8-7775-493a-a99b-c64d465aea68	2025-05-26 05:16:55.1	2025-06-02 05:16:55.1
1119	1124	35fe3bc3-90ce-4af3-a92b-75a20f3dd464	2025-05-26 05:17:49.082	2025-06-02 05:17:49.082
1120	1125	21c26957-5d49-42c4-8082-4f0310881581	2025-05-26 05:18:46.442	2025-06-02 05:18:46.442
1121	1126	2fdc299a-2055-4393-98d9-4b78cba9f2a8	2025-05-26 05:19:08.334	2025-06-02 05:19:08.334
1122	1127	8ec395ee-3656-496f-985a-192245ebc362	2025-05-26 05:19:47.862	2025-06-02 05:19:47.862
1123	1128	64c1bc14-9cf2-41c0-a652-2f4995632645	2025-05-26 05:20:49.094	2025-06-02 05:20:49.094
1124	1129	9b69c52e-9b07-4a8f-bc5e-35fc1215928a	2025-05-26 05:21:50.004	2025-06-02 05:21:50.004
1125	1130	905ffa7a-4e29-4f8d-a7d6-40cb8baf6869	2025-05-26 05:22:54.433	2025-06-02 05:22:54.433
1126	1131	dc985358-3bba-411f-9fc7-cc163911757c	2025-05-26 05:24:05.278	2025-06-02 05:24:05.278
1127	1132	eed6e015-cce1-4de4-ad74-e294a8193191	2025-05-26 05:24:05.532	2025-06-02 05:24:05.532
1128	1133	c5133e66-74e2-45ce-9ea4-e6979a24af3a	2025-05-26 05:24:05.677	2025-06-02 05:24:05.677
1129	1134	94d92824-4c23-47f0-b12f-3e3728ac60db	2025-05-26 05:24:08.294	2025-06-02 05:24:08.294
1130	1135	d8bfdffd-42fa-4276-9225-a71d52351234	2025-05-26 05:24:08.518	2025-06-02 05:24:08.518
1131	1136	80d2ea50-2f69-4ade-b58c-782f92c4ba2f	2025-05-26 05:24:09.635	2025-06-02 05:24:09.635
1132	1137	fbd88169-e11e-4133-b86e-f10dedb307cc	2025-05-26 05:24:09.815	2025-06-02 05:24:09.815
1133	1138	25e3fc1c-5dea-4933-b43b-2f84ade40b69	2025-05-26 05:24:09.817	2025-06-02 05:24:09.817
1134	1139	53be2bf4-090d-48ca-939f-1765b01d8fec	2025-05-26 05:24:10.064	2025-06-02 05:24:10.064
1135	1140	cc9a5be4-2577-46a0-a610-1bd108a35380	2025-05-26 05:24:10.27	2025-06-02 05:24:10.27
1136	1141	5e43db9b-6723-4a16-80b4-a53c6fb5bc87	2025-05-26 05:24:10.478	2025-06-02 05:24:10.478
1137	1142	c32c9612-bdbb-4e9b-b44b-430caaa2d632	2025-05-26 05:24:12.166	2025-06-02 05:24:12.166
1138	1143	c52ddfaf-ae73-47dc-b211-77f56b5fc2a2	2025-05-26 05:24:12.462	2025-06-02 05:24:12.462
1139	1144	93eac04e-1efe-433d-a7d0-29b48892479b	2025-05-26 05:24:12.474	2025-06-02 05:24:12.474
1140	1145	508fd7f5-60cd-4a91-a5bf-e074c8f449f8	2025-05-26 05:24:12.713	2025-06-02 05:24:12.713
1141	1146	757cbb68-cb64-41b4-a2fe-dc2105ffdaba	2025-05-26 05:24:12.902	2025-06-02 05:24:12.902
1142	1147	8909fa56-1f87-4ab9-86da-249b4d20fed4	2025-05-26 05:24:13.08	2025-06-02 05:24:13.08
1143	1148	c0d9fa71-c6cd-4ba3-8c4b-3b55b72ac4ed	2025-05-26 05:24:14.647	2025-06-02 05:24:14.647
1144	1149	3224515d-5f55-4afa-a42a-e506ff1c9982	2025-05-26 05:24:14.864	2025-06-02 05:24:14.864
1145	1150	bb933a00-d3fb-47dd-a3c4-fd8f0ae106cb	2025-05-26 05:24:14.873	2025-06-02 05:24:14.873
1146	1151	5f567b3a-2175-4dc5-83ad-34aec9b29956	2025-05-26 05:24:15.079	2025-06-02 05:24:15.079
1147	1152	f2dd35c0-d206-4d22-992f-7c43962d11fc	2025-05-26 05:24:15.261	2025-06-02 05:24:15.261
1148	1153	003a9e78-d0a2-42d4-ba2b-9bab63f49608	2025-05-26 05:24:15.461	2025-06-02 05:24:15.461
1149	1154	2e84fccb-44f9-43e7-b3ea-e7a2a3f8f6fa	2025-05-26 07:39:36.729	2025-06-02 07:39:36.729
1150	1155	8c2302c6-1e71-4a52-a960-52ab74f59d57	2025-05-26 08:29:38.096	2025-06-02 08:29:38.096
1151	1156	04e0e196-a3ec-492b-95e8-ca18c42f034c	2025-05-26 08:29:56.234	2025-06-02 08:29:56.234
1152	1157	d3b5a308-2cda-429c-8a98-1dffec74b096	2025-05-26 08:30:07.395	2025-06-02 08:30:07.395
1153	1158	1cdb6644-a646-403a-856d-1b5cc52d2087	2025-05-26 08:42:04.523	2025-06-02 08:42:04.523
1154	1159	162a2981-e0ff-436f-9377-9989ef02b830	2025-05-26 22:35:32.372	2025-06-02 22:35:32.372
1155	1160	dee79a9b-85c1-4cd2-ab89-c2ce135d89bc	2025-05-27 04:35:06.663	2025-06-03 04:35:06.663
1156	1161	c0bbf8bf-240b-4b98-8f31-56fc2cdd06b2	2025-05-27 06:50:20.738	2025-06-03 06:50:20.738
1157	1162	85200300-578b-47f3-b83c-c865283751ba	2025-05-27 08:04:38.54	2025-06-03 08:04:38.54
1158	1163	35fe0af3-04be-4cdb-b6be-9b26e5e8f8c2	2025-05-27 12:49:49.446	2025-06-03 12:49:49.446
1159	1164	68da75df-7b5e-42d8-96d8-8f3b699f6aa0	2025-05-27 13:01:46.451	2025-06-03 13:01:46.451
1160	1165	439147b3-a8a4-4544-aa2a-f24858f1da7a	2025-05-27 13:02:46.197	2025-06-03 13:02:46.197
1161	1166	dfc2c4e4-674a-414a-a227-b03ea0c5dafd	2025-05-27 13:15:33.466	2025-06-03 13:15:33.466
1162	1167	22d60ac9-01cc-4adc-8f0d-fc315057021f	2025-05-27 13:16:59.628	2025-06-03 13:16:59.628
1163	1168	41ce1af2-3846-4293-b5ac-cdd0020b3bb1	2025-05-27 13:23:42.265	2025-06-03 13:23:42.265
1164	1169	e7038afd-62f7-48b9-8c4c-a3c688041772	2025-05-27 13:34:08.998	2025-06-03 13:34:08.998
1165	1170	2e19052c-f058-4e7e-8934-723a9f5fdbed	2025-05-27 13:34:09.629	2025-06-03 13:34:09.629
1166	1171	819733b4-b811-42ad-b870-54767470cae3	2025-05-27 13:52:03.593	2025-06-03 13:52:03.593
1167	1172	303588cf-93ab-476d-8b94-7d99d46846b4	2025-05-27 14:00:23.042	2025-06-03 14:00:23.042
1168	1173	0e364491-8f81-4667-bba0-889dd33d18b6	2025-05-27 14:11:42.935	2025-06-03 14:11:42.935
1169	1174	2c82fb72-c737-4a5d-a0ec-443eac753f72	2025-05-27 14:38:41.965	2025-06-03 14:38:41.965
1170	1175	b7020e03-2e0f-4207-b8db-1ffb039d0074	2025-05-27 14:47:23.341	2025-06-03 14:47:23.341
1171	1176	1825a1da-88fb-4adb-99eb-99c27aaccf33	2025-05-27 19:54:41.369	2025-06-03 19:54:41.369
1172	1177	dd382483-a43b-4532-8d16-59469c5f0789	2025-05-27 20:35:57.676	2025-06-03 20:35:57.676
1173	1178	d4fe426a-639e-4aab-bb51-6f2106fad0d2	2025-05-27 21:05:16.597	2025-06-03 21:05:16.597
1174	1179	f2cb6e28-0039-4ada-b2f5-f4dc2f409695	2025-05-28 02:53:45.946	2025-06-04 02:53:45.946
1175	1180	3566dd01-dd08-4cbf-840a-dd4efab0a8fc	2025-05-28 11:55:20.794	2025-06-04 11:55:20.794
1176	1181	a8e4d16a-2f26-459c-871a-490929d94eae	2025-05-28 13:50:18.161	2025-06-04 13:50:18.161
1177	1182	3a45336b-bce8-4f89-8a20-924468206037	2025-05-28 15:41:41.439	2025-06-04 15:41:41.439
1178	1183	faafb5b3-ee5d-453d-b559-696ef9c14a79	2025-05-28 16:09:27.491	2025-06-04 16:09:27.491
1179	1184	47ca952a-bca2-4bbf-a438-2e4fa7b7aaf2	2025-05-28 16:57:39.387	2025-06-04 16:57:39.387
1180	1185	36b4dc57-a741-471f-9993-9e761b78d7f3	2025-05-28 18:31:05.905	2025-06-04 18:31:05.905
1181	1186	f680cec9-f8df-4638-919b-6ab4091a76ee	2025-05-28 18:32:08.319	2025-06-04 18:32:08.319
1182	1187	2b655ba5-fd04-4052-9ee1-1f0a7b1543d3	2025-05-28 18:32:56.047	2025-06-04 18:32:56.047
1183	1188	3304136d-21c4-4c89-93ee-b5e005e6c37e	2025-05-28 18:33:02.055	2025-06-04 18:33:02.055
1184	1189	5c7ab810-c5a2-4ec0-816d-343160ec2545	2025-05-28 18:33:57.543	2025-06-04 18:33:57.543
1185	1190	ad32d487-4082-43ed-abb5-0aaa26494624	2025-05-28 18:34:44.227	2025-06-04 18:34:44.227
1186	1191	8dc547c3-fa13-4271-8d15-992eff1765e6	2025-05-28 18:37:49.136	2025-06-04 18:37:49.136
1187	1192	02030b16-1eef-4d4a-b3cd-d90b5b02663c	2025-05-28 20:00:30.413	2025-06-04 20:00:30.413
1188	1193	3f246b90-918d-4f72-bec4-ea39133931c7	2025-05-29 03:13:47.066	2025-06-05 03:13:47.066
1189	1194	1ff902f1-b259-4e47-9d67-b8200b7d3138	2025-05-29 03:13:47.138	2025-06-05 03:13:47.138
1190	1197	e98157e8-2ba8-4794-864a-75a53fb34960	2025-05-29 03:13:49.881	2025-06-05 03:13:49.881
1191	1196	dca483c9-c4d9-4df9-829f-2962bf5e9ba4	2025-05-29 03:13:49.878	2025-06-05 03:13:49.878
1192	1195	c0d0a528-aede-4825-8eeb-090f0f0b1497	2025-05-29 03:13:49.88	2025-06-05 03:13:49.88
1193	1198	e80949d5-f5e0-4ded-be7f-ebad7bb5a730	2025-05-29 03:13:51.121	2025-06-05 03:13:51.121
1194	1199	38931e82-dbcb-4ba3-9067-3225c22c660b	2025-05-29 03:13:51.2	2025-06-05 03:13:51.2
1195	1200	dea63207-11f9-4ee0-b676-4de3ec2f8c43	2025-05-29 03:13:51.218	2025-06-05 03:13:51.217
1196	1201	4c967b3d-98b1-4e83-a634-3da4d79ca6aa	2025-05-29 03:13:51.317	2025-06-05 03:13:51.317
1197	1202	a686eaff-e3f7-432f-9d0b-f5c44aaf68b9	2025-05-29 03:13:51.334	2025-06-05 03:13:51.334
1198	1203	bb84834e-5ff8-4d76-9204-90ca8414209b	2025-05-29 03:13:51.434	2025-06-05 03:13:51.434
1199	1204	75f74b50-b94b-42b8-833e-beacff2fbbd4	2025-05-29 03:13:51.515	2025-06-05 03:13:51.515
1200	1205	14b8be3c-6280-4eae-85a2-64942dd2bf76	2025-05-29 03:13:51.521	2025-06-05 03:13:51.521
1201	1206	9be1940a-0c81-4ee5-a0b9-67c3c1e2951e	2025-05-29 03:13:51.559	2025-06-05 03:13:51.559
1202	1207	143b8710-402e-4911-9c86-30cdbe0926f5	2025-05-29 03:13:51.559	2025-06-05 03:13:51.559
1203	1210	bf0f8c28-24ed-4274-bb05-dcf3b9399054	2025-05-29 03:13:51.656	2025-06-05 03:13:51.656
1204	1209	43ec2b9e-1522-4781-a146-dc840d9c09bc	2025-05-29 03:13:51.654	2025-06-05 03:13:51.654
1205	1208	8990c34d-366a-49dd-a50a-67e1d1ccc00d	2025-05-29 03:13:51.656	2025-06-05 03:13:51.656
1206	1211	2a36541f-bc4b-4b5e-a1d5-0ea053081ca7	2025-05-29 03:13:51.657	2025-06-05 03:13:51.657
1207	1212	bfec85f7-c237-40d9-9b66-b4817d521d94	2025-05-29 03:13:51.658	2025-06-05 03:13:51.658
1208	1213	c5a4d367-d47c-4e05-960d-e6583d88187e	2025-05-29 03:13:51.66	2025-06-05 03:13:51.66
1209	1214	f36df1b9-9128-4cd9-912e-317f525d7e34	2025-05-29 03:13:51.752	2025-06-05 03:13:51.752
1210	1215	36e3d7e4-ddd3-415a-b8cc-2bb13af3eea7	2025-05-29 03:13:51.753	2025-06-05 03:13:51.753
1211	1216	ee26d23c-54ed-4ec3-b9d1-df1d768ad98a	2025-05-29 03:13:51.754	2025-06-05 03:13:51.754
1212	1217	76c6b755-b0c5-4df8-9729-9f9cfc59d242	2025-05-29 03:13:51.758	2025-06-05 03:13:51.758
1213	1218	cde38f38-0c6a-4c4a-a2bd-50c88db06bfb	2025-05-29 03:13:51.812	2025-06-05 03:13:51.812
1214	1219	90529290-2cf0-48fb-90a0-2ee411846f1e	2025-05-29 03:13:51.845	2025-06-05 03:13:51.845
1215	1220	008f08f5-de6c-4ada-a337-a07d4a4a034f	2025-05-29 03:13:51.853	2025-06-05 03:13:51.853
1216	1221	26212cad-1ddb-4388-9e00-8d51b6f0e022	2025-05-29 03:13:51.853	2025-06-05 03:13:51.853
1217	1222	9b21b0dc-af6e-4f4f-980b-ed111167528c	2025-05-29 03:13:51.856	2025-06-05 03:13:51.856
1218	1223	3151dbb8-05cc-4a01-b295-2fbbb629e87b	2025-05-29 03:13:51.905	2025-06-05 03:13:51.905
1219	1224	f9dc20a5-95cd-409c-951b-75baf7031a9a	2025-05-29 03:13:51.907	2025-06-05 03:13:51.907
1220	1225	fa0ce3fe-b0e4-4a6d-ac26-b50185356134	2025-05-29 03:13:51.946	2025-06-05 03:13:51.946
1221	1227	e69ab89f-7986-4a3d-af16-26e2c7a962a4	2025-05-29 03:13:51.947	2025-06-05 03:13:51.947
1222	1226	79053695-1bd6-4b4b-bf12-949de8379a87	2025-05-29 03:13:51.947	2025-06-05 03:13:51.947
1223	1229	9640a711-b9f0-43a9-8eb5-dbeafd72580b	2025-05-29 03:13:52.005	2025-06-05 03:13:52.004
1224	1228	8dd6f5c1-714e-425a-9e49-52b3fe627192	2025-05-29 03:13:52.005	2025-06-05 03:13:52.005
1225	1230	4c3e07b2-50c2-43fd-8428-cfa736c2826b	2025-05-29 03:17:00.955	2025-06-05 03:17:00.955
1226	1231	45bfb51e-a3ed-4359-bdde-b28a101fc6fa	2025-05-29 03:17:01.454	2025-06-05 03:17:01.454
1227	1232	a489b929-f374-43df-a921-05380fdc3628	2025-05-29 03:17:01.465	2025-06-05 03:17:01.465
1228	1233	5959f510-ffdb-4a95-ba5b-a0be7bbc5d11	2025-05-29 03:17:01.617	2025-06-05 03:17:01.617
1229	1234	5b1972c4-7dc3-4dbc-82e8-80f17c9754bc	2025-05-29 03:17:01.626	2025-06-05 03:17:01.626
1230	1236	700630da-f35c-4e9f-9f37-0ae473233ef9	2025-05-29 03:17:01.64	2025-06-05 03:17:01.64
1231	1235	d277a143-734a-44f8-abb7-5d4ae4620f2c	2025-05-29 03:17:01.646	2025-06-05 03:17:01.646
1232	1239	f19144c6-e7da-449e-b988-1a924054ac53	2025-05-29 03:17:01.799	2025-06-05 03:17:01.799
1233	1237	045f27cc-8ae1-45a1-a391-e3f4a7c82771	2025-05-29 03:17:01.803	2025-06-05 03:17:01.803
1234	1238	cb80a436-4966-4f4c-ae7c-cb108700f272	2025-05-29 03:17:01.804	2025-06-05 03:17:01.804
1235	1240	8c454cac-2bfd-487f-8e10-36ee1c5bd079	2025-05-29 03:17:01.829	2025-06-05 03:17:01.829
1236	1241	4c2f9c46-6630-48dc-b7df-4f7ed73295ca	2025-05-29 03:17:01.84	2025-06-05 03:17:01.84
1237	1244	22762f30-6867-4f03-87f9-4b2f8f32f579	2025-05-29 03:17:01.87	2025-06-05 03:17:01.87
1238	1242	6430bd5b-d549-4034-8cc9-1ea2ee2d8dcc	2025-05-29 03:17:01.871	2025-06-05 03:17:01.871
1239	1243	3068cc3a-e457-4d26-87a5-49c0b879b543	2025-05-29 03:17:01.871	2025-06-05 03:17:01.871
1240	1245	3577e5e1-4193-4f95-aaa4-459196c2382a	2025-05-29 03:17:01.875	2025-06-05 03:17:01.875
1241	1246	369a0a8e-1ca9-43a3-b71f-e9e91c9d5c0b	2025-05-29 03:17:01.895	2025-06-05 03:17:01.895
1242	1247	3e194bb8-205d-44ce-b3e1-1e97da156f97	2025-05-29 03:17:01.911	2025-06-05 03:17:01.911
1243	1248	123f2653-0711-43a5-8b1b-bded78c10825	2025-05-29 03:17:01.938	2025-06-05 03:17:01.938
1244	1249	ebb97ed1-e581-4ca8-b747-b6b1b23b2371	2025-05-29 03:17:01.937	2025-06-05 03:17:01.937
1245	1250	343a62e2-a1de-4000-a0d8-5b8458d5fdd3	2025-05-29 03:17:01.941	2025-06-05 03:17:01.941
1246	1251	961b90d0-099b-44c3-993b-29e63af8a399	2025-05-29 03:17:01.945	2025-06-05 03:17:01.945
1247	1252	3c0b4df4-7152-4c34-a772-24b0998214c3	2025-05-29 03:17:01.959	2025-06-05 03:17:01.959
1248	1253	8ffd59b9-d6a4-4ee3-8619-4b36b77ed5c7	2025-05-29 03:17:01.979	2025-06-05 03:17:01.979
1249	1256	e16634fd-d819-4e57-b8ef-cd60ec36d3aa	2025-05-29 03:17:02.011	2025-06-05 03:17:02.011
1250	1254	9b5095d7-eff7-4451-8514-2e16e248e2e6	2025-05-29 03:17:02.009	2025-06-05 03:17:02.009
1251	1255	9274163f-ab0b-4092-b7ee-54cf14093cce	2025-05-29 03:17:02.011	2025-06-05 03:17:02.011
1252	1257	9a38093f-5ae1-41ae-b47e-d2d6eed50331	2025-05-29 03:17:02.012	2025-06-05 03:17:02.012
1253	1258	fd6ea450-1f0e-4cc2-92eb-6d901a710330	2025-05-29 03:17:02.029	2025-06-05 03:17:02.029
1254	1259	78f09e5f-5087-4bcc-988c-73ed4a747a47	2025-05-29 03:17:02.045	2025-06-05 03:17:02.045
1255	1260	63e2fc20-afe3-458c-9a81-650bfb535d2a	2025-05-29 03:17:02.072	2025-06-05 03:17:02.072
1256	1261	792cd6bf-3d65-4b43-9cee-cbff0f716aee	2025-05-29 03:17:02.082	2025-06-05 03:17:02.082
1257	1262	5b7f4297-3dbd-44b8-ae39-6366590bac64	2025-05-29 03:17:02.085	2025-06-05 03:17:02.085
1258	1263	e9a27c51-825a-4edc-8909-2bdf48f0bd6f	2025-05-29 03:17:02.12	2025-06-05 03:17:02.12
1259	1264	33aad9ec-26dd-4dc5-b0ea-57520481f289	2025-05-29 03:17:02.141	2025-06-05 03:17:02.141
1260	1265	1db9cbc0-c580-4726-a37d-ac3206a59809	2025-05-29 03:17:02.147	2025-06-05 03:17:02.147
1261	1266	d3bdc1e1-5c92-4d2b-8822-88ec3c26edc6	2025-05-29 03:17:02.153	2025-06-05 03:17:02.153
1262	1267	c7a411f1-b390-47f4-a9c5-75762b38f8c1	2025-05-29 03:17:02.19	2025-06-05 03:17:02.19
1263	1268	3a15cef4-d6b7-47a3-8147-232ca0b7fca4	2025-05-29 03:17:02.207	2025-06-05 03:17:02.207
1264	1270	57c08e9a-444d-4e8a-98e8-7be18bda5be9	2025-05-29 03:17:02.213	2025-06-05 03:17:02.213
1265	1269	4a189229-9cfe-434c-9d93-46959d0aac8e	2025-05-29 03:17:02.213	2025-06-05 03:17:02.213
1266	1271	7b353f78-6850-4b35-8ef2-77c5111ea42e	2025-05-29 03:17:02.222	2025-06-05 03:17:02.222
1269	1274	6979b7ae-29f7-41ac-b620-00f9021c7586	2025-05-29 03:17:02.276	2025-06-05 03:17:02.276
1267	1272	424bfca7-2ace-46c3-9eeb-c4f418e4d71d	2025-05-29 03:17:02.228	2025-06-05 03:17:02.228
1268	1273	6d56892f-fd98-4dc7-8a4a-c472a394dce7	2025-05-29 03:17:02.267	2025-06-05 03:17:02.267
1270	1275	4aa2e525-2ab1-4da9-9b18-ba4a222316f5	2025-05-29 03:21:38.686	2025-06-05 03:21:38.686
1271	1276	3841e15c-b06d-4868-8026-f20a2c178ae8	2025-05-29 03:21:38.93	2025-06-05 03:21:38.93
1272	1277	6c11e4cf-3121-48b1-908f-c82fc40f7274	2025-05-29 03:21:39.421	2025-06-05 03:21:39.421
1273	1279	43c56143-c2de-48c8-972e-7131b7517da0	2025-05-29 03:21:39.918	2025-06-05 03:21:39.918
1274	1278	2773c569-7d77-428f-ab2c-87006b3d18af	2025-05-29 03:21:39.924	2025-06-05 03:21:39.924
1275	1280	be20eda8-d188-4ce5-87b8-7411d4f094cc	2025-05-29 03:21:39.961	2025-06-05 03:21:39.961
1276	1281	2ad14dcb-411f-4976-82d5-1d377992e93c	2025-05-29 03:21:39.969	2025-06-05 03:21:39.969
1277	1282	b6fc8c18-c123-4fc1-aa44-935011280b33	2025-05-29 03:21:40.042	2025-06-05 03:21:40.042
1278	1283	17c00c1d-2803-4a03-bf84-79cb863c2e10	2025-05-29 03:21:40.047	2025-06-05 03:21:40.047
1279	1284	108f5eae-a9eb-426b-acbd-44edd3327f26	2025-05-29 03:21:40.057	2025-06-05 03:21:40.057
1280	1285	444d1e36-5c27-44e5-a04d-2e438aa100ea	2025-05-29 03:21:40.176	2025-06-05 03:21:40.176
1281	1286	dac3b2be-aefd-46b2-a4f3-ad6528a2aa09	2025-05-29 03:21:40.177	2025-06-05 03:21:40.177
1282	1287	42148f94-e904-4c19-85d9-5d0ddf37a348	2025-05-29 03:21:40.186	2025-06-05 03:21:40.186
1283	1288	e103c622-df61-4889-a8f9-900755a87717	2025-05-29 03:21:40.223	2025-06-05 03:21:40.223
1284	1289	c3acf5b7-6659-4e73-be90-f8242ef32d59	2025-05-29 03:21:40.276	2025-06-05 03:21:40.276
1285	1290	e76e4590-bf3c-4be0-911d-ece71f5da5ab	2025-05-29 03:21:40.279	2025-06-05 03:21:40.279
1286	1291	f9de1acd-22f8-4f83-83a9-6dab5995f33f	2025-05-29 03:33:39.74	2025-06-05 03:33:39.74
1287	1292	fb9d1e1d-2ac4-4d00-a1f0-dce3d12aa162	2025-05-29 03:33:40.036	2025-06-05 03:33:40.036
1288	1293	612a62be-1156-4246-b458-9b602886a2fa	2025-05-29 03:33:41.25	2025-06-05 03:33:41.25
1289	1294	1e98c8c0-0e1f-4890-8f06-a7cb824be77b	2025-05-29 03:33:41.251	2025-06-05 03:33:41.251
1290	1296	d0dae9f1-0243-4010-9ad8-42aa8b0180eb	2025-05-29 03:33:41.72	2025-06-05 03:33:41.72
1291	1295	04c030c4-ffdc-45a0-b2ee-5fdd65d423e5	2025-05-29 03:33:41.721	2025-06-05 03:33:41.721
1292	1298	089a2460-efba-451f-bfb3-f1c407e015df	2025-05-29 03:33:41.739	2025-06-05 03:33:41.739
1293	1297	7907767b-f63a-491b-87fc-c37b70f589c6	2025-05-29 03:33:41.752	2025-06-05 03:33:41.752
1294	1299	da65b70a-b617-4eef-9e8a-ce91936d696a	2025-05-29 03:33:41.795	2025-06-05 03:33:41.795
1295	1300	f0e1d9b7-aa08-4e84-a726-9843527e3a0e	2025-05-29 03:33:41.804	2025-06-05 03:33:41.804
1296	1301	466478b5-5cd0-4cd7-9080-3fd76059bd61	2025-05-29 03:33:41.837	2025-06-05 03:33:41.837
1297	1303	40b3a50c-d662-4ebc-bdb8-20a0f66c5e6d	2025-05-29 03:33:41.846	2025-06-05 03:33:41.846
1298	1302	af353f83-e1ce-4423-bfc4-78a6cdf42834	2025-05-29 03:33:41.849	2025-06-05 03:33:41.849
1299	1304	d3a75636-8524-48ce-904a-6f9bd70e3a24	2025-05-29 03:33:41.88	2025-06-05 03:33:41.88
1300	1305	46ea557f-2a6d-4c01-b635-fc8af4b774ac	2025-05-29 03:33:41.911	2025-06-05 03:33:41.911
1301	1306	9fddb962-86a5-4502-86a1-19d2ae3380a3	2025-05-29 03:33:41.917	2025-06-05 03:33:41.917
1302	1307	676d0515-afb7-4523-8274-2b212d9c1fa6	2025-05-29 03:33:41.919	2025-06-05 03:33:41.919
1303	1308	65851b8b-18ca-4dce-a9ff-76617f1a206a	2025-05-29 03:33:41.923	2025-06-05 03:33:41.923
1304	1309	2e3feadc-7714-4b69-af24-9ff5f63ed863	2025-05-29 03:33:41.951	2025-06-05 03:33:41.951
1305	1310	5514836d-cf10-43b9-8fd8-7b8443fd6b14	2025-05-29 03:33:41.951	2025-06-05 03:33:41.951
1306	1311	31da41e9-a0dc-44f3-b70c-c4fcd9a8d852	2025-05-29 03:33:41.983	2025-06-05 03:33:41.983
1307	1312	19402023-3bd3-4347-be90-3d7135003eb5	2025-05-29 03:33:41.988	2025-06-05 03:33:41.988
1308	1313	9c25f93e-0645-4963-858b-6cee815fc866	2025-05-29 03:33:41.991	2025-06-05 03:33:41.991
1309	1314	0647fd87-f42c-4f57-ae19-4cd3d612154c	2025-05-29 03:33:41.997	2025-06-05 03:33:41.997
1310	1316	d406f375-8bca-45a5-a5be-7541900ab857	2025-05-29 03:33:42.025	2025-06-05 03:33:42.025
1311	1315	50ffd187-5a91-43a2-aad9-3eba8e0d06ec	2025-05-29 03:33:42.026	2025-06-05 03:33:42.026
1312	1317	42edb5ef-92f2-49dd-9a6e-d7f43611b187	2025-05-29 03:33:42.053	2025-06-05 03:33:42.053
1313	1318	66c46205-03ff-4ce8-a06a-05e52abbda64	2025-05-29 03:33:42.063	2025-06-05 03:33:42.063
1314	1320	5efbe1ff-95a6-405d-8332-94f517376905	2025-05-29 03:33:42.069	2025-06-05 03:33:42.069
1315	1319	a893c8a9-3fae-442a-b3b2-44c9c51f4f4d	2025-05-29 03:33:42.07	2025-06-05 03:33:42.07
1316	1321	6f92a972-b33c-44dd-994b-d792fa6f29f1	2025-05-29 03:33:42.093	2025-06-05 03:33:42.093
1317	1322	653f7806-9c54-448c-a13e-a033615a35a5	2025-05-29 03:33:42.097	2025-06-05 03:33:42.097
1318	1323	a511be68-081f-4132-8e28-c757ca057eda	2025-05-29 03:33:42.122	2025-06-05 03:33:42.122
1319	1324	be3d5107-4571-4532-b913-22bee157db3a	2025-05-29 03:33:42.128	2025-06-05 03:33:42.128
1320	1326	157f3dae-4250-401e-abf8-8474f347cebb	2025-05-29 03:33:42.14	2025-06-05 03:33:42.14
1321	1325	1d072be9-e263-4a37-84d6-cb0a843d0b74	2025-05-29 03:33:42.14	2025-06-05 03:33:42.14
1322	1327	f9666db1-2a64-4197-83d1-6e182c92e3f6	2025-05-29 03:33:42.156	2025-06-05 03:33:42.156
1323	1328	8b0ceaf7-6ef2-4ae7-af90-bde542848c9a	2025-05-29 03:33:42.17	2025-06-05 03:33:42.17
1324	1329	0c42e45c-4cd6-42e4-aeb1-dff950f1fc46	2025-05-29 03:33:42.281	2025-06-05 03:33:42.281
1325	1330	44902403-fdec-4269-af13-829a7c6d3a77	2025-05-29 03:33:42.53	2025-06-05 03:33:42.53
1326	1331	b3d83f7f-3c6c-48c7-9c76-0f3dc2ec3c59	2025-05-29 03:56:00.287	2025-06-05 03:56:00.287
1327	1332	f7ace513-8c89-4aa7-9905-a37c8d7969b6	2025-05-29 03:56:02.209	2025-06-05 03:56:02.209
1328	1333	9ad83897-e8c3-4972-a54d-8b574f294a7c	2025-05-29 03:56:02.474	2025-06-05 03:56:02.474
1329	1334	0eed175c-43a2-4916-83fe-ac70f9d63543	2025-05-29 03:56:03.347	2025-06-05 03:56:03.346
1330	1336	030d7dbb-38c0-42a8-bf48-988cb0afde64	2025-05-29 03:56:03.405	2025-06-05 03:56:03.405
1331	1335	db33392e-411a-4015-8a3e-aadb9608f8c4	2025-05-29 03:56:03.404	2025-06-05 03:56:03.404
1332	1337	27653e6d-0a2f-4645-91a4-7677bde71766	2025-05-29 03:56:03.474	2025-06-05 03:56:03.474
1333	1338	36907a77-de31-49cb-b878-160251fc6f99	2025-05-29 03:56:03.473	2025-06-05 03:56:03.473
1334	1339	a7a8eb01-5fc4-43bf-a2e0-7f47c8946df1	2025-05-29 03:56:03.557	2025-06-05 03:56:03.557
1335	1340	ed87685c-2681-400f-9779-90f4c2b50498	2025-05-29 03:56:03.561	2025-06-05 03:56:03.561
1336	1341	bd6232ee-5019-4962-b4fc-10636934c5d3	2025-05-29 03:56:03.625	2025-06-05 03:56:03.625
1337	1342	628c08cf-acaf-42cc-b088-9902b7efe5d7	2025-05-29 03:56:03.646	2025-06-05 03:56:03.646
1338	1345	b98f4d6f-c9cb-42c9-bd18-73db9a80eb5a	2025-05-29 03:56:03.694	2025-06-05 03:56:03.694
1339	1344	3b9890f5-6d47-4cc0-a857-485feb307e78	2025-05-29 03:56:03.693	2025-06-05 03:56:03.693
1340	1346	948240e7-7142-4c87-b767-a691aa081b24	2025-05-29 03:56:03.695	2025-06-05 03:56:03.695
1341	1343	b6dde89a-04de-4c50-bf0c-c84a8dde84f0	2025-05-29 03:56:03.696	2025-06-05 03:56:03.696
1342	1348	da2dcfa2-3e01-4b7b-b006-41e26439302c	2025-05-29 03:56:03.769	2025-06-05 03:56:03.769
1343	1347	b2165aa7-69c3-42b1-99b0-deddfd2d319b	2025-05-29 03:56:03.77	2025-06-05 03:56:03.77
1344	1349	2b0bf072-8061-4a85-a704-b9971859b0fe	2025-05-29 03:56:03.771	2025-06-05 03:56:03.771
1345	1350	aa7ad5fe-baf8-431d-85b5-aa0c88cf250c	2025-05-29 03:56:03.774	2025-06-05 03:56:03.774
1346	1351	b9cbe868-6d35-4f8f-91db-ed9122df00d0	2025-05-29 03:56:03.779	2025-06-05 03:56:03.779
1347	1352	2135389a-f4ec-4b2e-b75f-dc6dc9d78714	2025-05-29 03:56:03.829	2025-06-05 03:56:03.829
1348	1353	15683839-c026-43ab-a804-8b8bc945c719	2025-05-29 03:56:03.843	2025-06-05 03:56:03.843
1349	1355	e61ac9df-0edb-42cb-bb7d-b3e6596185fb	2025-05-29 03:56:03.847	2025-06-05 03:56:03.847
1350	1354	8af4503d-bc0e-444a-94aa-44b03dd8cb9d	2025-05-29 03:56:03.845	2025-06-05 03:56:03.845
1351	1356	7d76719e-931f-405b-b185-e6dde517e374	2025-05-29 03:56:03.848	2025-06-05 03:56:03.848
1352	1357	6a4b4c98-9755-4849-ab67-ad3ed9fc7173	2025-05-29 03:56:03.868	2025-06-05 03:56:03.868
1353	1358	0a6ff0ba-f417-4c08-b8ce-cb5e0b814951	2025-05-29 03:56:03.909	2025-06-05 03:56:03.909
1354	1359	9d7d42f8-c074-4e88-83ce-01ce6577d2fa	2025-05-29 03:56:03.915	2025-06-05 03:56:03.915
1355	1360	f261f9a7-4fce-43b5-aef8-6f820a1ee91f	2025-05-29 03:56:03.916	2025-06-05 03:56:03.916
1356	1361	7fdc770b-afec-444c-a402-08cf023d2e2a	2025-05-29 03:56:03.935	2025-06-05 03:56:03.935
1360	1365	609cf50f-c2d2-4d83-8e9f-fd24ce19ae83	2025-05-29 03:56:03.992	2025-06-05 03:56:03.992
1357	1362	9fa47472-ca60-4c69-8c4d-58b9114eb291	2025-05-29 03:56:03.935	2025-06-05 03:56:03.935
1361	1366	bc6846b4-7741-4edb-bcc6-b49cb28fd025	2025-05-29 03:56:03.997	2025-06-05 03:56:03.997
1358	1363	20b3922d-da9e-4247-bbcd-f337b811dae0	2025-05-29 03:56:03.946	2025-06-05 03:56:03.946
1359	1364	352dca58-8ac7-4a09-acf9-b5ec69896fcb	2025-05-29 03:56:03.986	2025-06-05 03:56:03.986
1362	1367	8ffa8493-b77b-437d-ae3f-ee16b0a5c545	2025-05-29 03:56:04.014	2025-06-05 03:56:04.014
1363	1368	deb23f3b-c78b-460b-b6ab-9eb162109ad6	2025-05-29 03:56:04.026	2025-06-05 03:56:04.026
1364	1369	750305b3-954d-4194-a477-ce1c10f5471c	2025-05-29 04:50:25.4	2025-06-05 04:50:25.4
1365	1370	4f02774f-26ce-41b8-9306-26855f0c09e5	2025-05-29 04:50:27.592	2025-06-05 04:50:27.592
1366	1371	70f988c8-51c7-4e5d-8263-102de82423e6	2025-05-29 04:50:30.073	2025-06-05 04:50:30.073
1367	1372	fc7d85d5-4a3b-41cb-9bd3-bf3d0a07846f	2025-05-29 05:10:08.224	2025-06-05 05:10:08.224
1368	1373	b3da3437-225d-4109-9a05-2ed174ac873a	2025-05-29 07:01:05.338	2025-06-05 07:01:05.338
1369	1374	66fb6bbf-9044-4c3f-b6d0-33d911edab19	2025-05-29 07:51:13.8	2025-06-05 07:51:13.8
1370	1375	c70e201c-a5cc-4764-a721-7657e8287ee7	2025-05-29 12:45:48.734	2025-06-05 12:45:48.734
1371	1376	48c31da1-fc59-40b7-b3d5-53b04c80c944	2025-05-29 12:45:52.829	2025-06-05 12:45:52.829
1372	1377	aa7e90ef-a410-4b2f-aa87-56cfe00d20ea	2025-05-29 13:03:13.4	2025-06-05 13:03:13.4
1373	1378	98af8700-120d-446c-976a-a99fefad70bd	2025-05-29 13:03:13.907	2025-06-05 13:03:13.907
1374	1379	0013f11d-2329-4d24-ac43-c605d1f9f1e8	2025-05-29 14:12:31.729	2025-06-05 14:12:31.729
1375	1380	fd4e6834-6e30-42d7-a229-8a50de82c27f	2025-05-29 15:12:17.657	2025-06-05 15:12:17.657
1376	1381	2e2f06ac-80cc-4202-b41c-c9d0e9856b1b	2025-05-29 15:55:39.474	2025-06-05 15:55:39.474
1377	1382	5cc6794d-16d5-4265-b0e7-4bd39fe720c5	2025-05-29 15:56:14.639	2025-06-05 15:56:14.639
1378	1383	85c1054e-237e-49f6-99c2-bbd87d8e1c99	2025-05-29 17:02:01.458	2025-06-05 17:02:01.458
1379	1384	3f794042-6ec9-45b3-9554-29734be0dc5e	2025-05-29 19:33:16.312	2025-06-05 19:33:16.312
1380	1385	5e337206-d152-4e87-adbf-e11dffd8537d	2025-05-29 22:55:35.257	2025-06-05 22:55:35.257
1381	1386	c8e297c2-61af-4844-ba3b-8461cfda7ad3	2025-05-30 00:26:29.189	2025-06-06 00:26:29.189
1382	1387	f1fb05b1-30cf-4513-a4b3-aa84a30f7933	2025-05-30 00:29:33.454	2025-06-06 00:29:33.454
1383	1388	0fdee000-090a-4fd4-b46f-f44c087edcad	2025-05-30 00:59:37.573	2025-06-06 00:59:37.573
1384	1389	bf81baa2-d799-4f8b-bc59-a8dd83dec06b	2025-05-30 00:59:39.374	2025-06-06 00:59:39.374
1385	1390	1d44b817-a49f-4ab3-afd3-fd52ca5b32f4	2025-05-30 06:06:22.464	2025-06-06 06:06:22.463
1386	1391	b799233c-8372-4ea0-a76c-a7ea51b20cc0	2025-05-30 09:16:47.286	2025-06-06 09:16:47.286
1387	1392	57e95e80-8306-4ac3-99e4-d645622c76a5	2025-05-30 11:15:59.903	2025-06-06 11:15:59.903
1388	1393	be5e641f-936c-4263-b809-b908a179ac10	2025-05-30 14:14:44.162	2025-06-06 14:14:44.162
1389	1394	27e7de2b-182d-49dd-91f6-98c8fec9bf9d	2025-05-30 15:55:20.185	2025-06-06 15:55:20.185
1390	1395	491a001a-ba09-46ac-9371-e6da1bcec0cb	2025-05-30 17:14:43.359	2025-06-06 17:14:43.359
1391	1396	2dc8e31f-c2b6-401e-b5c3-5a25714601b5	2025-05-30 17:32:33.483	2025-06-06 17:32:33.483
1392	1397	7ea94bda-a4d4-411a-8b14-687568e474f2	2025-05-31 14:02:33.159	2025-06-07 14:02:33.159
1393	1398	01420230-8a53-447d-875a-7ccc7ea18a33	2025-05-31 14:02:33.755	2025-06-07 14:02:33.755
1394	1399	192362f9-44bd-4771-a3fb-22545889b1af	2025-05-31 19:50:44.016	2025-06-07 19:50:44.016
1395	1400	178ed47f-de3f-48d1-a6d2-b82b083739c7	2025-06-01 04:27:27.142	2025-06-08 04:27:27.142
1396	1401	09ed2f6b-6520-4c8f-b0a3-3179d6f1d8d2	2025-06-01 05:45:42.035	2025-06-08 05:45:42.035
1397	1402	428a5981-c266-4376-9769-91cd8fe731e5	2025-06-01 08:07:27.319	2025-06-08 08:07:27.319
1398	1403	a7539ee6-9dd1-42ff-b3bf-7ec739bcb729	2025-06-01 12:41:06.863	2025-06-08 12:41:06.863
1399	1404	60495318-c04f-41e5-a995-70fc930740cc	2025-06-01 16:12:34.142	2025-06-08 16:12:34.142
1400	1405	d6040082-c14e-477b-b557-17dcd097df59	2025-06-01 16:29:50.58	2025-06-08 16:29:50.58
1401	1406	b7af0971-0051-4604-ac8a-50eb3f993183	2025-06-01 16:53:59.61	2025-06-08 16:53:59.61
1402	1407	58cfe7e4-6439-435c-82b9-45ec5da135ba	2025-06-01 18:49:32.67	2025-06-08 18:49:32.67
1403	1408	5fc4b0f7-fcb4-44de-960e-c5637721183a	2025-06-02 12:43:53.347	2025-06-09 12:43:53.347
1404	1409	ffe12cc1-4437-4cce-9582-6dc49c6fa7cd	2025-06-02 19:57:07.442	2025-06-09 19:57:07.442
1405	1410	b910b437-46ba-48d8-a488-73ede25e3975	2025-06-02 20:37:18.678	2025-06-09 20:37:18.678
1406	1411	bac889de-531d-43e6-b0be-c53d1c3a95c3	2025-06-03 02:35:13.206	2025-06-10 02:35:13.206
1407	1412	8ea6db3c-6a8e-4cb9-ac58-ce2231660508	2025-06-03 05:44:28.865	2025-06-10 05:44:28.865
1408	1413	323971b3-05d9-49d1-9fd4-a5becbabdb12	2025-06-03 05:44:29.629	2025-06-10 05:44:29.629
1409	1414	ebb62be1-c388-4dc8-86ee-0969f8d15aa2	2025-06-03 05:44:29.897	2025-06-10 05:44:29.897
1410	1415	bd4a8b77-02da-4285-bea2-a94290e50335	2025-06-03 05:58:01.38	2025-06-10 05:58:01.38
1411	1416	86c6ca1a-d532-4c4e-b028-9e41bd33e4fc	2025-06-03 06:05:19.976	2025-06-10 06:05:19.976
1412	1417	e35ede9f-5ba9-4dd8-8122-9d9036398e02	2025-06-03 07:24:15.734	2025-06-10 07:24:15.734
1413	1418	063623ba-789d-416a-9e77-b92df0660b6f	2025-06-03 10:22:37.965	2025-06-10 10:22:37.965
1414	1419	45b69826-f212-4bd1-9fbc-5f99fcade771	2025-06-03 13:40:35.979	2025-06-10 13:40:35.979
1415	1420	773916cb-b3a4-46f1-a812-246cd9fcae96	2025-06-03 14:47:29.966	2025-06-10 14:47:29.966
1416	1421	122d5e25-491a-4e90-8a7b-c19b95900914	2025-06-03 16:09:33.87	2025-06-10 16:09:33.87
1417	1422	be225e85-0428-458c-a29b-bd4c451eabf6	2025-06-03 18:53:50.135	2025-06-10 18:53:50.135
1418	1423	9336fa84-8472-47e9-aa34-db5aba27d75c	2025-06-03 18:54:18.39	2025-06-10 18:54:18.39
1419	1424	f9e7406f-8395-4c83-ab73-8d1fc61f4cd8	2025-06-03 19:28:02.028	2025-06-10 19:28:02.028
1420	1425	a0e7786d-f37c-4878-8e95-142dd7db5df0	2025-06-03 20:06:19.356	2025-06-10 20:06:19.356
1421	1426	64e1e3e4-ae81-4b54-b666-fed1477c78fd	2025-06-03 20:56:55.223	2025-06-10 20:56:55.223
1422	1427	c286a9ee-a7b7-41eb-8f56-fa228f861f75	2025-06-03 21:31:32.317	2025-06-10 21:31:32.317
1423	1428	cc5e3797-7335-406e-a03d-29f70919007b	2025-06-04 01:27:23.746	2025-06-11 01:27:23.746
1424	1429	697db43d-385d-4efc-9ff3-58919b689e2c	2025-06-04 01:54:26.306	2025-06-11 01:54:26.306
1425	1430	2ff66663-a805-4de6-a639-0293aacfe742	2025-06-04 01:54:36.653	2025-06-11 01:54:36.653
1426	1431	fff8ed5e-2241-4065-aeb7-f8b46ae2fbda	2025-06-04 01:54:46.111	2025-06-11 01:54:46.111
1427	1432	f90fb61a-1496-42c9-a4b8-94c924ccf2b1	2025-06-04 01:54:54.496	2025-06-11 01:54:54.496
1428	1433	666e1905-dcd0-47d7-979a-fea54fd1f51d	2025-06-04 02:03:32.987	2025-06-11 02:03:32.986
1429	1434	9268b267-f4ee-4b5c-8cc3-aa09ce3e69d0	2025-06-04 02:03:54.363	2025-06-11 02:03:54.363
1430	1435	e31945d9-5ef4-46eb-957f-f7bc8e43283f	2025-06-04 02:03:56.482	2025-06-11 02:03:56.482
1431	1436	0c5d48bb-126b-4723-a8f4-b501246c16e8	2025-06-04 02:03:58.745	2025-06-11 02:03:58.745
1432	1437	87e1e9f4-f65c-4741-a7fe-91f3bfaa9114	2025-06-04 02:04:10.317	2025-06-11 02:04:10.317
1433	1438	94b558a1-9d18-40ad-85cd-ff5c230daacc	2025-06-04 05:11:35.379	2025-06-11 05:11:35.379
1434	1439	a0dbc7ca-223b-42da-ac5b-91cc1dbb5d11	2025-06-04 07:17:45.156	2025-06-11 07:17:45.156
1435	1440	2b1cb9fe-f5b2-4747-8cbe-5d8650ba20f5	2025-06-04 08:26:07.269	2025-06-11 08:26:07.269
1436	1441	e2dfe1d7-e65b-4f6c-ae18-fb488748974e	2025-06-04 08:26:11.136	2025-06-11 08:26:11.136
1437	1442	19a37257-90f9-45d2-83ed-eb44632c10f8	2025-06-04 08:26:38.621	2025-06-11 08:26:38.621
1438	1443	6704527e-e000-494d-8370-b57d4453fd8f	2025-06-04 08:26:42.503	2025-06-11 08:26:42.503
1439	1444	2ccf2c13-d27c-4936-b222-dbcc63a30334	2025-06-04 08:26:46.142	2025-06-11 08:26:46.142
1440	1445	6f78498a-ea17-4b88-9d24-f0b1ccb09ec5	2025-06-04 08:26:50.738	2025-06-11 08:26:50.738
1441	1446	ca6f42a0-de50-455f-996f-24a44f2d1e86	2025-06-04 08:26:53.425	2025-06-11 08:26:53.425
1442	1447	64740e03-ae3d-43a6-b7f5-f7a9efa12540	2025-06-04 08:26:55.173	2025-06-11 08:26:55.173
1443	1448	0f78c387-1667-4572-84c4-b4ff58334557	2025-06-04 08:26:58.132	2025-06-11 08:26:58.132
1444	1449	6152249f-803b-4351-97e2-5e56e1307136	2025-06-04 08:27:01.314	2025-06-11 08:27:01.314
1445	1450	9100b071-2f0e-464f-9049-251786311939	2025-06-04 08:27:05.112	2025-06-11 08:27:05.112
1446	1451	bdd690b9-e185-4d0e-b673-89c62c99ab89	2025-06-04 08:27:09.959	2025-06-11 08:27:09.959
1447	1452	235a58bb-2232-4107-adef-a99c4b9a210f	2025-06-04 08:27:13.6	2025-06-11 08:27:13.6
1448	1453	3be73bb6-1f52-46f7-96a3-8c3ea8d2f4ab	2025-06-04 08:27:15.453	2025-06-11 08:27:15.453
1449	1454	de962d6e-f282-41a0-9724-1b4aebac1c5d	2025-06-04 08:27:17.114	2025-06-11 08:27:17.114
1450	1455	207032c9-4aff-4e2c-a065-b03de763086d	2025-06-04 08:27:21.459	2025-06-11 08:27:21.458
1451	1456	18d312c2-7a0d-416e-a099-41677272c569	2025-06-04 08:27:28.547	2025-06-11 08:27:28.547
1452	1457	1ba9ce14-4736-42df-b370-4d9744ba6b02	2025-06-04 08:27:36.735	2025-06-11 08:27:36.735
1453	1458	8dd2cc69-5424-453e-b784-bb605f1772b3	2025-06-04 08:27:38.886	2025-06-11 08:27:38.886
1454	1459	eab8ecec-4ec0-4e4d-82e5-b96b28a3b571	2025-06-04 08:27:42.767	2025-06-11 08:27:42.767
1455	1460	958b1092-c262-4585-83e8-2a6a207ab4e9	2025-06-04 08:27:47.628	2025-06-11 08:27:47.628
1456	1461	9b0559e0-b4bb-4e04-a0b1-d388421cafd6	2025-06-04 08:27:49.545	2025-06-11 08:27:49.545
1457	1462	ca536903-fdf8-40af-86d5-54c6d26b6af8	2025-06-04 08:27:56.489	2025-06-11 08:27:56.489
1458	1463	cb3de17e-fe5b-4c2c-88a4-e17a975ea3b2	2025-06-04 08:27:58.64	2025-06-11 08:27:58.64
1459	1464	40609959-d189-404b-b468-de456b6c1ff3	2025-06-04 08:28:14.317	2025-06-11 08:28:14.317
1460	1465	a34c406f-d34b-4f4b-a3f1-593c88228553	2025-06-04 08:28:19.548	2025-06-11 08:28:19.548
1461	1466	271f6aed-eb5f-4ba1-a6f9-2d406ffef609	2025-06-04 08:28:20.69	2025-06-11 08:28:20.69
1462	1467	7d932727-381f-4256-8e96-8aa4715fd46e	2025-06-04 08:28:23.615	2025-06-11 08:28:23.615
1463	1468	f59e2407-86b4-4aa3-ae7a-4673465877fb	2025-06-04 08:28:25.821	2025-06-11 08:28:25.821
1464	1469	0e31e19d-6e59-43dc-88bd-3a0f4829e0e4	2025-06-04 08:28:29.682	2025-06-11 08:28:29.682
1465	1470	dd5b1338-2c4f-413a-85c4-efb9ebba701a	2025-06-04 08:28:32.061	2025-06-11 08:28:32.061
1466	1471	17b8ef55-8600-4561-8d1b-ece422aabc16	2025-06-04 08:28:33.417	2025-06-11 08:28:33.417
1467	1472	b358b51b-25e0-47c7-b345-a56a026cbcca	2025-06-04 08:28:34.722	2025-06-11 08:28:34.722
1468	1473	3cb3fae2-ed29-4dc9-8919-1d4196e89655	2025-06-04 08:28:42.672	2025-06-11 08:28:42.672
1469	1474	d664507b-4ca8-471b-b400-22ace063c730	2025-06-04 08:28:44.056	2025-06-11 08:28:44.056
1470	1475	9cd599b2-ca34-43b2-a1a2-0e6fd3252463	2025-06-04 08:28:47.295	2025-06-11 08:28:47.295
1471	1476	7796a6b5-cb8d-4d6c-9cb5-7f4ba78be0c9	2025-06-04 08:28:50.42	2025-06-11 08:28:50.42
1472	1477	7f384ea4-5806-4a6e-b385-5ca3c6f70656	2025-06-04 08:28:56.754	2025-06-11 08:28:56.754
1473	1478	c570c2f5-42b5-40b3-9e6c-db5484fd45df	2025-06-04 08:29:01.614	2025-06-11 08:29:01.614
1474	1479	df399d05-b038-47c8-b4eb-e6431112e7bb	2025-06-04 08:29:03.256	2025-06-11 08:29:03.256
1475	1480	7a29f568-1659-4085-8adf-e45dce82327b	2025-06-04 08:29:05.485	2025-06-11 08:29:05.485
1476	1481	f67128b6-1d7e-4e4b-9038-7c24f09a89ba	2025-06-04 08:29:09.481	2025-06-11 08:29:09.481
1477	1482	12c2340e-95f5-479b-ac92-944448e6efe9	2025-06-04 08:29:12.499	2025-06-11 08:29:12.499
1478	1483	6c8b0ae9-2a59-4e79-beae-54c908e78684	2025-06-04 08:29:14.214	2025-06-11 08:29:14.214
1479	1484	d75fe5e1-6cf8-4d71-8227-f6198bea9070	2025-06-04 08:29:20.882	2025-06-11 08:29:20.882
1480	1485	694b1027-f1d5-472f-b653-f0fed929664c	2025-06-04 08:29:24.39	2025-06-11 08:29:24.39
1481	1486	f06a7cab-37af-4270-89c4-d36ad34a30ba	2025-06-04 08:29:28.809	2025-06-11 08:29:28.809
1482	1487	5aa9b083-9d6b-43bd-a98d-cdc727d6cd49	2025-06-04 08:29:31.199	2025-06-11 08:29:31.199
1483	1488	6d30cc64-54bc-483d-90e5-1bcedfaf841f	2025-06-04 08:29:36.271	2025-06-11 08:29:36.271
1484	1489	90e6da85-aeb6-4c2b-99a5-616ae0bdec04	2025-06-04 15:40:59.861	2025-06-11 15:40:59.861
1485	1490	55199d00-1b22-4ec7-8fef-d720cddac537	2025-06-04 22:05:20.324	2025-06-11 22:05:20.324
1486	1491	de226cd6-bb73-4138-869e-05764b949a07	2025-06-04 22:37:12.896	2025-06-11 22:37:12.896
1487	1492	89935bc1-77de-4cca-9e99-51ee62b1ff46	2025-06-04 22:42:07.794	2025-06-11 22:42:07.794
1488	1493	ac353038-266a-4778-929b-c6196e0ce224	2025-06-05 00:35:05.113	2025-06-12 00:35:05.113
1489	1494	d481dacb-4e45-409a-9b70-301b74f99f33	2025-06-05 04:35:26	2025-06-12 04:35:26
1490	1495	cde8b1b0-2386-40d7-9881-caa05b430874	2025-06-05 04:35:30.367	2025-06-12 04:35:30.367
1491	1496	5d00e9cd-8d6a-4515-9efc-c0a33ede6e1c	2025-06-05 04:35:33.047	2025-06-12 04:35:33.047
1492	1497	eef958c6-07aa-41a2-b065-dada750f7145	2025-06-05 08:08:49.471	2025-06-12 08:08:49.471
1493	1498	3852ddf3-cd91-4096-ae4f-ae75178a0e0f	2025-06-05 19:16:11.104	2025-06-12 19:16:11.104
1494	1499	f6d00bb5-60ec-45c5-b8c8-540cb4e3f026	2025-06-05 21:25:43.565	2025-06-12 21:25:43.565
1495	1500	e02a75af-911a-489b-a499-6bbfa42fea83	2025-06-05 21:51:35.107	2025-06-12 21:51:35.107
1496	1501	69db5679-1561-4ca1-8b4a-b3098ac1ccf0	2025-06-06 00:40:23.637	2025-06-13 00:40:23.637
1497	1502	db5a1466-5e4e-4460-9765-921c9236f366	2025-06-06 07:26:37.221	2025-06-13 07:26:37.221
1498	1503	0b99f60f-0631-491e-a3f1-a5e8bf8f6fad	2025-06-06 09:02:09.204	2025-06-13 09:02:09.204
1499	1504	72d92e5b-e7fd-4c51-b84d-3bb4fbcda667	2025-06-06 16:03:19.774	2025-06-13 16:03:19.774
1500	1505	98e9b460-6688-4345-846b-457588a8be7d	2025-06-06 17:33:36.664	2025-06-13 17:33:36.664
1501	1506	8c8bf062-d7cc-474b-9d6c-daed1ceae10a	2025-06-06 18:35:06.291	2025-06-13 18:35:06.291
1502	1507	beae8fb8-137c-49ff-a552-7b6b6107034a	2025-06-06 19:14:58.8	2025-06-13 19:14:58.8
1503	1508	2b837dc4-08df-4106-9ad4-12ca442015ce	2025-06-06 22:23:48.426	2025-06-13 22:23:48.426
1504	1509	527bc073-6ab9-4297-aca0-52691fdfdcc2	2025-06-06 23:22:11.732	2025-06-13 23:22:11.732
1505	1510	dc8ffa5e-4317-4c07-a4d6-85b9bd6b2ba9	2025-06-07 09:41:23.072	2025-06-14 09:41:23.072
1506	1511	3249c7d2-4d7a-4d88-8a00-e32d9e755104	2025-06-07 12:58:18.402	2025-06-14 12:58:18.402
1507	1512	e6a49a0c-4ef8-4b5c-b066-6b274c6658a9	2025-06-07 16:18:29.168	2025-06-14 16:18:29.168
1508	1513	9ea2ae5a-32e5-447e-b073-31c0d2ec3bba	2025-06-08 13:47:58.145	2025-06-15 13:47:58.145
1509	1514	8d92087c-01a8-4f69-83cf-d476ae17113a	2025-06-08 13:47:59.264	2025-06-15 13:47:59.263
1510	1515	83b5e090-4d9b-4729-a969-019e9db6bd82	2025-06-08 13:47:59.458	2025-06-15 13:47:59.458
1511	1516	7cd4c330-5ce8-4586-aba8-9686964597e2	2025-06-08 17:32:08.087	2025-06-15 17:32:08.087
1512	1517	a9543b3d-8bfa-48df-ac71-a37961a2fbaa	2025-06-08 19:04:33.734	2025-06-15 19:04:33.734
1513	1518	29a42d01-8650-4712-b40c-d15b9eb9e68e	2025-06-08 19:04:33.938	2025-06-15 19:04:33.938
1514	1519	6b3b5fcf-5e67-4602-8804-94b773752087	2025-06-08 21:51:30.131	2025-06-15 21:51:30.131
1515	1520	9c03a760-768c-486f-af2a-9ffe6619faca	2025-06-08 23:23:40.299	2025-06-15 23:23:40.299
1516	1521	6947481b-0e3e-49f6-b135-8063de5cb9f5	2025-06-09 00:16:49.679	2025-06-16 00:16:49.679
1517	1522	d544ca19-4d0e-4e9e-ae17-d044a3eec638	2025-06-09 00:16:50.514	2025-06-16 00:16:50.514
1518	1523	d309ecf3-4687-4a89-aee1-a0b7ba524e50	2025-06-09 00:17:10.68	2025-06-16 00:17:10.68
1519	1524	4ed89355-2ad8-46dc-98b1-ec18c1ac86be	2025-06-09 00:17:11.044	2025-06-16 00:17:11.044
1520	1525	3780a965-6017-4dc0-82c1-b6b0198a8e42	2025-06-09 00:17:11.376	2025-06-16 00:17:11.376
1521	1526	06100bd9-e251-4c11-bf47-244ce9d55a97	2025-06-09 00:17:11.712	2025-06-16 00:17:11.712
1522	1527	152594bc-6dd0-4450-9520-d5d9ade50eb0	2025-06-09 00:17:11.997	2025-06-16 00:17:11.997
1523	1528	ad091895-b59f-4657-b8ec-4bee7e06b1f8	2025-06-09 00:17:12.278	2025-06-16 00:17:12.278
1524	1529	8249e50d-7b8c-4e75-ba0f-dc8c71f0bf36	2025-06-09 00:17:12.59	2025-06-16 00:17:12.59
1525	1530	d66e1bc9-3055-4422-ac92-605e38d3c170	2025-06-09 00:17:12.944	2025-06-16 00:17:12.944
1526	1531	507674b9-5d9f-4dab-b532-b894685c9918	2025-06-09 00:17:13.275	2025-06-16 00:17:13.275
1527	1532	92505c8d-8ab5-4afc-ba1b-116007bc7f89	2025-06-09 00:17:13.593	2025-06-16 00:17:13.593
1528	1533	ebc091eb-f433-41d6-8ef2-233fa8556b76	2025-06-09 00:17:13.884	2025-06-16 00:17:13.884
1529	1534	78e354a3-8ba3-4974-9323-7e520d96a98f	2025-06-09 00:17:14.221	2025-06-16 00:17:14.221
1530	1535	659ebe4c-f1b6-49e0-a75c-1cbf98c70acd	2025-06-09 00:17:14.548	2025-06-16 00:17:14.548
1531	1536	439d68bf-c980-4cf5-be8b-6a95ec277793	2025-06-09 00:17:14.966	2025-06-16 00:17:14.966
1532	1537	9c41e573-fb6c-4282-aafc-49072f7c4372	2025-06-09 00:17:15.309	2025-06-16 00:17:15.309
1533	1538	4935e996-c48a-456f-bbe6-a162916a19e0	2025-06-09 00:17:15.628	2025-06-16 00:17:15.628
1534	1539	6960b6f4-4e0b-4616-9290-1fe76193f4e0	2025-06-09 00:17:15.905	2025-06-16 00:17:15.905
1535	1540	f90371af-401e-4dea-bb5e-14db81c46175	2025-06-09 00:17:16.463	2025-06-16 00:17:16.463
1536	1541	ab860b2a-3279-4375-817c-bfc4256b45fe	2025-06-09 00:17:16.833	2025-06-16 00:17:16.833
1537	1542	540e14c2-9734-4c07-8ed1-66481286133a	2025-06-09 00:17:17.332	2025-06-16 00:17:17.332
1538	1543	a7db9efa-6086-4913-a37c-c627cf86c477	2025-06-09 00:17:17.939	2025-06-16 00:17:17.939
1539	1544	84161eca-6e7b-4990-941d-fce05c0c2f43	2025-06-09 00:17:18.31	2025-06-16 00:17:18.31
1540	1545	7d130d0e-6191-4aad-8fcd-dbc99d3664b7	2025-06-09 00:17:18.868	2025-06-16 00:17:18.868
1541	1546	81e8b735-d4a7-4ecc-83e9-fe61b3e9856b	2025-06-09 00:17:19.326	2025-06-16 00:17:19.326
1542	1547	aa3d01c1-f2d0-4999-8392-ca78f58ac4f6	2025-06-09 00:17:19.753	2025-06-16 00:17:19.753
1543	1548	3d946b20-096f-4d4e-96fe-d1e20a792a55	2025-06-09 00:17:20.213	2025-06-16 00:17:20.213
1544	1549	d75d74b9-7b38-4b4d-8776-3799d6d24431	2025-06-09 00:17:20.64	2025-06-16 00:17:20.64
1545	1550	ba21dc7b-166a-4870-92c6-1e79f4cab9bf	2025-06-09 00:17:21.098	2025-06-16 00:17:21.098
1546	1551	68471d27-7021-4647-a36f-5e4587354b67	2025-06-09 00:17:21.548	2025-06-16 00:17:21.548
1547	1552	af3a5271-b092-4ef2-90c4-13e3155bcba4	2025-06-09 00:17:21.969	2025-06-16 00:17:21.969
1548	1553	eef2f0d3-741b-45ea-bef8-e8ca63e6bdfd	2025-06-09 00:17:22.4	2025-06-16 00:17:22.4
1549	1554	654f2672-cfc1-4b4d-99fa-8016f6372e36	2025-06-09 00:17:22.82	2025-06-16 00:17:22.82
1550	1555	6e4f76e3-902c-479c-ab6f-ff6020936b4b	2025-06-09 00:17:23.219	2025-06-16 00:17:23.219
1551	1556	41413b0d-59c6-4f3c-8970-9f82ae85ef95	2025-06-09 00:17:23.61	2025-06-16 00:17:23.61
1552	1557	48e4e410-1695-49d9-b144-0703c19d4cfd	2025-06-09 02:52:57.947	2025-06-16 02:52:57.947
1553	1558	01d09544-c178-40cd-af28-aa615e3d20ad	2025-06-09 15:00:54.2	2025-06-16 15:00:54.2
1554	1559	882f695a-393b-4fea-ae16-c8a0792da256	2025-06-09 18:28:39.243	2025-06-16 18:28:39.243
1555	1560	c8dcc05d-6740-4019-aade-a30331a800b8	2025-06-09 18:51:01.636	2025-06-16 18:51:01.636
1556	1561	b42a5733-ec10-4edf-884b-ac4d18ac3b51	2025-06-09 19:04:03.729	2025-06-16 19:04:03.728
1557	1562	59e5da22-13cb-4ce1-b590-da9f9b8ab6e4	2025-06-09 21:11:16.234	2025-06-16 21:11:16.234
1558	1563	fa382f59-1fdd-41f2-8573-f75264f644c6	2025-06-09 21:11:37.04	2025-06-16 21:11:37.04
1559	1564	60861e74-bfdb-42ae-bd2b-426244fd1ea3	2025-06-09 23:52:51.634	2025-06-16 23:52:51.634
1560	1565	cf484165-8a11-4bcd-9c85-ed62fd218b9a	2025-06-10 08:23:15.003	2025-06-17 08:23:15.003
1561	1566	abb4cbba-742f-4c6b-adb6-e524bcd09afa	2025-06-10 17:26:34.134	2025-06-17 17:26:34.134
1562	1567	81c1eed0-b04e-4fa7-9f85-c0d72f2ced65	2025-06-10 21:04:11.415	2025-06-17 21:04:11.415
1563	1568	325e3e09-2aea-4e44-ae74-31b3d9a47a74	2025-06-10 23:42:49.522	2025-06-17 23:42:49.522
1564	1569	a7f64574-86c7-400d-aece-691516838a7e	2025-06-11 20:27:21.635	2025-06-18 20:27:21.635
1565	1570	c7a299ff-df27-4c46-87ab-a756ff35df79	2025-06-11 20:33:58.363	2025-06-18 20:33:58.363
1566	1571	904691b7-a390-4343-9a6d-2f63945e6491	2025-06-11 21:18:49.295	2025-06-18 21:18:49.295
1567	1572	20bf14a9-d050-4d46-8a69-999d4fa3c022	2025-06-11 22:04:40.664	2025-06-18 22:04:40.664
1568	1573	cc16e4d6-a141-4d65-ab40-fff5643b415a	2025-06-11 22:04:40.862	2025-06-18 22:04:40.862
1569	1574	bc9750e0-8238-4ade-b8cd-48f92e8d1bf0	2025-06-11 22:04:40.972	2025-06-18 22:04:40.972
1570	1575	dbffa2a5-0d1b-4888-8560-65e48c04251e	2025-06-11 23:59:14.216	2025-06-18 23:59:14.216
1571	1576	b607cc8a-374b-432e-95bf-2a6262ce22fd	2025-06-11 23:59:15.188	2025-06-18 23:59:15.188
1572	1577	e150283e-0232-4ae3-87f7-34540d9d2fef	2025-06-12 00:05:46.988	2025-06-19 00:05:46.988
1573	1578	ed7c2ac2-983f-425d-9108-1bf004b16c60	2025-06-12 00:24:06.969	2025-06-19 00:24:06.969
1574	1579	ac5f8e47-556c-40dd-a91a-46366e9b6b5d	2025-06-12 04:16:24.145	2025-06-19 04:16:24.145
1575	1580	07c57f7e-b26d-42d9-a1af-d3b3392b6af6	2025-06-12 11:36:27.701	2025-06-19 11:36:27.701
1576	1581	a8d95991-4083-40c8-ae71-a4ad1f6ef794	2025-06-12 11:56:12.609	2025-06-19 11:56:12.609
1577	1582	b6d78e11-3d8f-475e-b330-56cc238cf3df	2025-06-12 11:57:15.128	2025-06-19 11:57:15.128
1578	1583	fd57894c-eed5-46bd-94a5-91d2d1a32317	2025-06-12 12:30:58.286	2025-06-19 12:30:58.286
1579	1584	72e786d2-c413-45c3-a0f9-4544ba9a2cd8	2025-06-12 12:52:53.387	2025-06-19 12:52:53.387
1580	1585	2057c295-5491-485d-bd63-a6d8f016b54c	2025-06-12 14:07:51.35	2025-06-19 14:07:51.35
1581	1586	8d9ff10e-d625-4df9-9ea1-9e121104a059	2025-06-12 14:32:43.961	2025-06-19 14:32:43.961
1582	1587	e0ed204f-41b1-4b80-afa6-c177fd980b24	2025-06-12 15:29:40.898	2025-06-19 15:29:40.898
1583	1588	5fcbf2c3-1891-4125-8b85-ecda76001d9d	2025-06-12 15:42:52.238	2025-06-19 15:42:52.238
1584	1589	6c9031a4-9076-426d-b867-e7e9aba34fd5	2025-06-12 18:45:08.864	2025-06-19 18:45:08.864
1585	1590	d5173db2-0cc4-4c91-a030-c658b279b233	2025-06-12 20:23:50.462	2025-06-19 20:23:50.462
1586	1591	309d1779-d84a-4111-9f7e-70ccd6ddf587	2025-06-12 21:47:31.964	2025-06-19 21:47:31.964
1587	1593	b24a8933-60db-43c8-adc3-c219b7e30ab3	2025-06-12 22:02:39.488	2025-06-19 22:02:39.488
1589	1592	d3a712b2-66f8-4c3b-9d38-4cda65580beb	2025-06-12 22:02:39.49	2025-06-19 22:02:39.49
1588	1594	76c45aac-e51b-45ab-9452-dc59f6f823aa	2025-06-12 22:02:39.49	2025-06-19 22:02:39.49
1590	1595	cbba7394-2151-426a-8f30-e3e0873a03bb	2025-06-12 22:02:39.823	2025-06-19 22:02:39.823
1591	1596	124b3684-795b-4a06-94d2-462f48dc42a3	2025-06-12 22:02:40.105	2025-06-19 22:02:40.105
1593	1598	502eefcf-107a-4630-8322-46a340a4d14d	2025-06-12 22:05:44.225	2025-06-19 22:05:44.225
1592	1597	6824e61b-ca0f-4011-8773-366ac33eedd6	2025-06-12 22:05:44.224	2025-06-19 22:05:44.224
1594	1599	a4d800f4-5de5-4d98-8895-94435fbf5f10	2025-06-12 22:45:43.649	2025-06-19 22:45:43.649
1595	1600	0b87da13-deed-4370-9672-8cb5f01da932	2025-06-12 22:45:43.917	2025-06-19 22:45:43.917
1596	1601	8dfb3afe-f045-460b-afbd-79e87c06b3c7	2025-06-13 00:52:35.856	2025-06-20 00:52:35.856
1597	1602	6b8035cc-fe15-434d-b60e-b82c792ca599	2025-06-13 02:39:53.426	2025-06-20 02:39:53.426
1598	1603	287b7388-dd23-43e6-8bd7-52f00b8e00b5	2025-06-13 02:39:54.743	2025-06-20 02:39:54.743
1599	1604	42613a7d-fdcf-4794-aa49-a0de2bfa0e54	2025-06-13 03:17:12.584	2025-06-20 03:17:12.584
1600	1605	5ced2ad2-2311-4821-a6c2-2a0c518df119	2025-06-13 05:12:07.112	2025-06-20 05:12:07.112
1601	1606	ec2fe03d-f3a6-48e8-bf36-a5ad56d77aa8	2025-06-13 05:12:46.465	2025-06-20 05:12:46.465
1602	1607	e1e679b8-a9ea-444f-ac78-e9086a2fa9a6	2025-06-13 05:20:02.658	2025-06-20 05:20:02.658
1603	1608	d1f8a1f6-49be-4da9-a626-70146abcf0af	2025-06-13 05:20:15.485	2025-06-20 05:20:15.485
1604	1609	8c18117e-5bcf-4151-a105-0ae4f4d2dd68	2025-06-13 06:12:05.64	2025-06-20 06:12:05.64
1605	1610	2de7bf63-cd4a-4fee-9e10-c7feecc33061	2025-06-13 06:13:27.594	2025-06-20 06:13:27.594
1606	1611	e2cfe5c0-a802-47bb-8e64-4ee058f0f73d	2025-06-13 06:24:56.602	2025-06-20 06:24:56.602
1607	1612	620fb190-a675-468f-8da8-31a7a10f4114	2025-06-13 09:49:59.935	2025-06-20 09:49:59.935
1608	1613	0fad8ea0-a450-4dfa-b106-78c37cd251ce	2025-06-13 11:27:58.914	2025-06-20 11:27:58.914
1609	1614	0af5242f-2a5d-42e1-9861-5cc8d02c77b1	2025-06-13 13:35:35.114	2025-06-20 13:35:35.114
1610	1615	2419d4c6-bcd3-400d-b2c6-734fede1420f	2025-06-13 15:01:20.065	2025-06-20 15:01:20.065
1611	1616	2d6cce9c-6707-462a-be44-b7fea345e539	2025-06-13 16:04:05.765	2025-06-20 16:04:05.765
1612	1617	12e828bb-4b34-4272-af65-37833891bde2	2025-06-13 17:25:59.245	2025-06-20 17:25:59.245
1613	1618	b83ba872-4cd1-4348-a0b5-55fa2ffef99f	2025-06-13 17:37:13.26	2025-06-20 17:37:13.26
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, created_at) FROM stdin;
1	anonymous-f773d761	c02fce33-8314-49aa-9d9e-4d6e213b9cf3	2025-05-10 03:04:39.101
2	anonymous-e524aad8	ac66c843-f805-4351-80e0-2ea86b2b43a4	2025-05-10 03:07:56.826
3	anonymous-a473d566	07e48b23-c0a7-4ee3-abd9-9134740ddb22	2025-05-10 03:08:50.305
4	anonymous-cdc1422c	f421682d-d56f-43e2-b42e-2b15853966cc	2025-05-11 01:15:29.218
5	anonymous-1b9cb283	9915db01-387b-46aa-bc73-6b472b1222b9	2025-05-12 14:10:54.158
6	anonymous-e9c5d519	c953ae06-d221-4907-b2a5-32ad7661f1b1	2025-05-12 18:02:44.119
7	anonymous-b61d7247	1a4eae4d-2493-4ba1-85f7-ab7d90420d37	2025-05-12 21:52:43.173
8	anonymous-42847a43	b380e778-2f0c-4584-8b8a-1bef46af924d	2025-05-12 21:56:00.448
9	anonymous-06667cb1	aa169f11-7b9c-4a8e-9a82-870970bd6eea	2025-05-12 22:10:52.908
10	anonymous-6dddab77	c9e24d6b-c101-4e46-b025-37dfad0ae0ed	2025-05-12 22:22:47.969
11	anonymous-52298477	fe939bee-1567-46a9-acf2-d89a344df9e3	2025-05-12 22:53:53.054
12	anonymous-65dec17e	8ad64c8c-7946-475b-8c7e-2f1527c00ef0	2025-05-12 23:36:30.277
13	anonymous-a4854e19	ab769603-1cd3-4ff6-ab94-152af035ffc8	2025-05-13 00:06:06.632
14	anonymous-797494c4	b103fd7b-1442-4d55-8774-7a145e5d4d1e	2025-05-13 01:31:24.452
15	anonymous-c1c42a7b	dff32be4-0e27-4162-ba46-eff8a28b359b	2025-05-13 02:01:17.166
16	anonymous-b52b1d7c	138d48b8-9f76-4850-8ed0-784f803912dd	2025-05-13 03:24:27.173
17	anonymous-47384908	a473619e-2495-4754-b981-6f3dffba55a6	2025-05-13 03:50:34.936
18	anonymous-6a715c22	d6d07015-67d1-45f3-9c97-ba32dd49cf55	2025-05-13 04:33:38.371
19	anonymous-100c4817	93e80a73-d70d-452e-b872-8b7534535bd0	2025-05-13 06:47:10.552
20	anonymous-14465254	7f666700-d965-4d75-8380-b609c714c47d	2025-05-13 07:51:13.759
21	anonymous-d6381614	c5687caa-6587-4df4-a130-b92c897caf7f	2025-05-13 09:43:41.64
22	anonymous-570d783f	c9661aa3-aa53-4c86-aa9a-1d285f39e9a5	2025-05-13 13:33:46.725
23	anonymous-de05f818	87780355-43c2-4869-8136-15acc45b2933	2025-05-13 14:03:39.517
24	anonymous-0f766e65	0f39bffe-44cc-48f2-8fa6-62d5af24ae7d	2025-05-13 14:24:36.734
25	anonymous-212756fc	299a2e6c-b400-4d32-95bd-8159a368b4d2	2025-05-13 14:42:21.933
26	anonymous-34f5253e	1b267aac-5569-46b9-88ce-c43fdcf7f0bf	2025-05-13 15:35:38.517
27	anonymous-50c01b7e	22ab9ab8-86c4-4eec-bf4f-eaa1530bc516	2025-05-13 16:33:43.37
28	anonymous-468ed25d	3fb32e8d-28e0-49b8-97a2-ac23254d2874	2025-05-13 17:36:07.89
29	anonymous-e6f374a4	2150b162-39d5-4f91-97da-43e685a8f951	2025-05-13 18:20:18.107
30	anonymous-37c72531	ce947ebd-f7da-44df-9d50-caacd5962089	2025-05-13 18:54:15.668
31	anonymous-57af904c	2ec6ec4f-d7a4-442e-9f6d-540b3fa436d2	2025-05-13 18:56:54.595
32	anonymous-d154c220	684dd79a-c571-425c-9453-8f6bd2756260	2025-05-13 18:56:51.807
38	anonymous-421fd342	585b5fab-85fa-4b38-945d-87fe4b162ad9	2025-05-13 19:05:23.317
39	anonymous-e5a80ca0	3e351e12-0efe-492a-b842-141f9b896bd3	2025-05-13 19:05:26.739
40	anonymous-d083100b	06d1995a-4fe7-4495-8099-c076e2ac03cf	2025-05-13 19:36:17.026
41	anonymous-3c419d7f	bd362133-9e2a-4d72-906d-a3e547e7c0d9	2025-05-13 20:30:17.071
42	anonymous-1d608f54	6549e6c1-1da0-4f05-91b4-cd54c7f82177	2025-05-13 20:50:39.967
43	anonymous-63b554fc	49467fb5-61e8-4b39-8274-1640375ae02c	2025-05-13 20:51:16.813
44	anonymous-a9ef954a	109f946c-eb01-4695-93a2-f323ced67cbb	2025-05-13 20:59:53.917
45	anonymous-e8d5331d	3aaa5d3d-6ed1-449f-97d8-5e62c6f174cf	2025-05-13 21:00:17.156
46	anonymous-2bbe9813	cef153f9-0f83-4786-b8b6-8bc3005018a8	2025-05-13 21:01:24.418
47	anonymous-bc8ef613	f1d7c883-f734-42d5-927c-f3312fc02867	2025-05-13 21:01:28.479
48	anonymous-7c869dff	ef0ed2fd-de39-4e53-9de9-2f71dbf7cf4a	2025-05-13 21:01:33.931
49	anonymous-451c19fc	ac7bcb84-c696-4ae3-ae46-35964ea69c7c	2025-05-13 21:13:12.652
50	anonymous-d2bbd423	3957612d-8cb0-43ed-b007-4b109887ce3e	2025-05-13 22:50:48.211
51	anonymous-5574f04c	1f4d4904-56f3-4773-9ab6-40c8d49d2870	2025-05-13 22:50:48.24
52	anonymous-f350d442	a00753b2-b448-4c07-b30c-05699f4952ea	2025-05-13 22:50:49.854
53	anonymous-58415269	55c4ee41-2f2b-48d1-b5e1-82c8acf35d01	2025-05-13 22:50:49.923
54	anonymous-a1024d19	cc88a522-835c-4b22-8558-1bbef5fdcb0e	2025-05-13 22:50:49.929
55	anonymous-e2fb8067	2f81201d-1fd5-4d32-95ff-3619cb36af1c	2025-05-13 22:50:50
56	anonymous-0cf32f6d	55fc9749-4995-4e34-a87e-3440a4c01fe4	2025-05-13 22:50:50.949
57	anonymous-9dce77c2	40ee0fe9-a7de-47dc-bbec-8376a4d9aef2	2025-05-13 22:50:50.986
58	anonymous-69ee55bd	ff220f03-cac4-4820-97b0-d0e993bf64e8	2025-05-13 22:50:51.427
59	anonymous-02074c0e	735453c8-3355-4d2c-8239-6ee2aa14f5ab	2025-05-13 22:50:51.606
60	anonymous-e4241ce5	af077dd7-509f-4063-aafc-e2d400c12489	2025-05-13 22:50:51.429
61	anonymous-16728b20	bb128b7c-10d3-452f-8727-cc54f0adcae0	2025-05-13 22:50:50.993
62	anonymous-c1595eba	f9fc86e9-405d-49a5-b819-a199a5bc3b84	2025-05-13 22:50:51.355
63	anonymous-d38eb467	568f94b5-edcb-4e07-9bfe-09b316ddfe74	2025-05-13 22:50:51.801
64	anonymous-e2a95e15	3a560526-54e1-496c-bd33-843f3e243cb2	2025-05-13 22:50:51.804
65	anonymous-966e819e	e88f1643-edf3-4f71-bc51-38a136760de7	2025-05-13 22:50:51.813
66	anonymous-e1a99752	b0c99344-c34c-4486-bcca-8ed6f72f7c76	2025-05-13 22:50:51.821
67	anonymous-e3dccea0	a55e0bd0-0a1a-4340-ae8b-85d286b46b23	2025-05-13 22:50:51.898
68	anonymous-c35fd44c	30356d18-aef2-4e66-8d76-d1806021cf9d	2025-05-13 22:50:51.93
69	anonymous-c7207c2c	11c89c1f-545d-4467-a2ab-578242658fce	2025-05-13 22:50:51.939
70	anonymous-2c05ac9b	5f5087f0-9de8-44a7-bb11-a1a550c74154	2025-05-13 22:50:51.951
71	anonymous-827afa47	a398b877-9070-46c9-88be-a9985f025b59	2025-05-13 22:50:52.08
72	anonymous-9ab8a272	09307d94-dc7b-479c-a900-930fe1efffdc	2025-05-13 22:50:52.118
73	anonymous-7997e025	14a37503-5c9c-4e29-98cd-a96f3e5a0d7a	2025-05-13 22:50:52.185
74	anonymous-21bee8de	be42f679-bf84-4c49-a929-3099883fda86	2025-05-13 22:50:52.248
75	anonymous-cff04218	17a87206-668b-4145-8ba4-da6d4785c2f3	2025-05-13 22:50:52.281
76	anonymous-728e6736	d08d781f-e88e-423b-8266-f3b4db3b30f3	2025-05-13 22:50:52.311
77	anonymous-7ea9b9af	616759f1-5f88-4c94-ab7f-ed8ae00385a0	2025-05-13 22:50:52.324
78	anonymous-9b9a14d5	895027ff-d5c9-4b36-af9b-21eeb1c32cc1	2025-05-13 22:50:52.34
79	anonymous-0c7983c8	e27911a7-3cbc-445c-aeee-2b58d675f1ca	2025-05-13 22:50:52.359
80	anonymous-63729cfb	6df5ba8c-233c-4d35-bb98-a4c9611dbc61	2025-05-13 22:50:52.434
81	anonymous-c7e0d08d	2dc76928-0c13-4a4b-9f2d-f2dc2f23659f	2025-05-13 22:50:52.497
82	anonymous-1558a7e2	83531c52-acf0-494c-8489-2c0677616825	2025-05-13 22:50:52.57
83	anonymous-f3b178c2	0d94bb67-1bac-4bcc-9bd6-aa0467610e5f	2025-05-13 22:50:52.609
84	anonymous-0e8ccb6f	2d27ea09-0924-4873-878e-ef7656f79f22	2025-05-13 22:50:52.668
85	anonymous-f4103093	0f7af687-b6dd-4a76-b70a-3c29895ccdd5	2025-05-13 22:50:52.729
86	anonymous-7aaa45e7	95ca318a-df74-417b-8b17-85dc00f8939a	2025-05-13 22:50:52.859
87	anonymous-47f4c93c	3013640b-32c6-4ee6-ae1a-57161dbc5ac8	2025-05-13 22:50:52.929
90	anonymous-19baa676	518523b4-a2c0-493c-a4c0-fdd3601711c3	2025-05-13 22:50:53.016
91	anonymous-e82a578c	cf106a5e-03db-4896-98ac-2e637b515640	2025-05-13 22:50:53.075
94	anonymous-eb73301f	e472639c-4363-4397-a154-c91b2be1b522	2025-05-13 22:50:53.124
100	anonymous-e6b0efda	ffe57c9f-91ae-459f-9dd4-dcacfc881205	2025-05-13 22:50:53.385
110	anonymous-b0d165c4	95764232-28a1-4dbe-9a5d-3b28dbf08043	2025-05-13 22:50:53.656
115	anonymous-2f17f0d0	2c14d628-65d7-4d44-a463-d50edda6f27c	2025-05-13 22:50:53.894
116	anonymous-01f1f073	00f64346-1afd-46d7-a489-841ff003897e	2025-05-13 22:50:53.977
118	anonymous-d428d894	bdbcb4e7-8cf0-4f6d-a7b4-3aa5c9cd8391	2025-05-13 22:50:54.063
119	anonymous-515ab7ff	741ce112-d804-4bba-abd9-3c51829df3f1	2025-05-13 22:50:54.109
88	anonymous-2ee39dcb	03cabb3e-80a5-4387-a400-a418d646ea9c	2025-05-13 22:50:52.97
101	anonymous-fe092a83	a57d6cdd-6e01-4f65-9fae-c8c77ff865c7	2025-05-13 22:50:53.403
102	anonymous-792c2981	ee0b71db-2e35-42e3-b011-577349981bea	2025-05-13 22:50:53.455
89	anonymous-81244960	77ba5969-191c-4724-b5f7-0fc05fda90e7	2025-05-13 22:50:52.975
103	anonymous-46326658	73e0b0b4-d15e-4143-aec8-650e924a2ee5	2025-05-13 22:50:53.454
105	anonymous-4666073d	00b88814-54af-4254-b899-866246102022	2025-05-13 22:50:53.504
113	anonymous-53c5bd25	299da7d8-1f2a-42b8-afda-d52e86ffa075	2025-05-13 22:50:53.804
114	anonymous-a68761da	62d07468-938f-4a17-a22a-3d21746dda71	2025-05-13 22:50:53.849
121	anonymous-a3b3e47e	2c3c3db5-9594-4cab-b9ee-60c9bacc208d	2025-05-13 22:50:54.151
123	anonymous-ba83cc65	7af1fd69-7be3-4dbb-ac05-705cddca02dc	2025-05-13 22:50:54.224
125	anonymous-dcdffbf8	df5cf6d3-a7ba-4de9-9b18-75db7ddb003a	2025-05-13 22:50:54.269
129	anonymous-145304dd	f28f4285-5441-48b1-8185-0d7f724e72f4	2025-05-13 22:50:54.469
130	anonymous-8645faa2	244e854a-1741-4e93-8cb8-53bb5ded7d5f	2025-05-13 22:50:54.69
131	anonymous-6fc51d86	a0e00dc2-afed-4f35-bf6d-a958b4229e7d	2025-05-13 22:50:54.814
92	anonymous-792113ed	842cafca-dac3-45b3-83fb-1986c945f85e	2025-05-13 22:50:53.079
98	anonymous-cffdd5df	0dc7d8db-07ad-4546-9a16-b1fba16102fe	2025-05-13 22:50:53.264
99	anonymous-6af38bf3	572a9241-2568-4cac-aea8-ebd12422e2cf	2025-05-13 22:50:53.36
104	anonymous-0753ad3b	c8036e9b-df82-41f6-949b-a21609aa337e	2025-05-13 22:50:53.48
107	anonymous-76e5db64	842478bd-9b30-43af-b08a-912782e23d8b	2025-05-13 22:50:53.569
109	anonymous-7547f007	36871689-1c24-49db-badc-71fa2073831f	2025-05-13 22:50:53.64
93	anonymous-10114ba5	3a973065-56bb-4d6b-9d2b-28cc453f6c6f	2025-05-13 22:50:53.09
97	anonymous-033f0f7a	2f02c443-0967-4f6d-84ff-ac18d18f0179	2025-05-13 22:50:53.198
106	anonymous-55b769ae	51981115-d6df-48ae-99aa-40f0183e1771	2025-05-13 22:50:53.519
108	anonymous-179b7338	f5cd23e3-1524-4a65-af32-d13c9cf9aab5	2025-05-13 22:50:53.604
111	anonymous-b7a7cac0	db6fac3a-ac8d-40a2-a02d-52ec36e708f9	2025-05-13 22:50:53.744
117	anonymous-5b27134c	702246b9-e8ed-47d4-a5da-1f4ce5a84eed	2025-05-13 22:50:53.995
120	anonymous-5519ad79	df5872dd-f068-4206-b261-da0a4f3c8ab4	2025-05-13 22:50:54.15
126	anonymous-a41e47f3	be20533f-fda3-4a1b-975f-d5a0f59791b6	2025-05-13 22:50:54.29
127	anonymous-cf9c323b	b8740478-7e7c-4ac8-b334-98ab8880a284	2025-05-13 22:50:54.339
128	anonymous-f2ae2777	965f84f6-3889-4561-a2bf-68fcb22a228b	2025-05-13 22:50:54.444
95	anonymous-a983fc23	702d2b6a-9577-46cd-b45c-6c072849b302	2025-05-13 22:50:53.175
112	anonymous-2ced9188	56b73cb8-0128-4ff3-9155-ef446e253428	2025-05-13 22:50:53.774
122	anonymous-80b12d2d	7ef6af54-6c06-445a-8d50-da2d6155d274	2025-05-13 22:50:54.154
124	anonymous-32a50550	fc5599f9-9ff3-4a0e-ba82-fda0904064c1	2025-05-13 22:50:54.259
96	anonymous-7f133116	02f23b06-869b-4002-9561-5e25b6a2525c	2025-05-13 22:50:53.179
132	anonymous-3c869f99	83d263da-2772-4d30-9e5e-674c50226758	2025-05-13 23:05:34.968
133	anonymous-4e4f23b8	238b0fb1-5acb-49d7-a77c-493f65a4dd44	2025-05-13 23:36:34.801
134	anonymous-9854a0ec	99d8e9a5-0c02-410a-bee2-e74a16f9640f	2025-05-14 00:33:34.178
135	anonymous-d0cfa2c6	b7acbdcf-cfc6-4d89-9912-3f2f6dd647a9	2025-05-14 00:50:23.149
136	anonymous-696cd1ef	2b6940c9-433b-4aba-a7dd-93394347a0a4	2025-05-14 02:21:32.683
137	anonymous-0f4b0822	2d22a742-a22e-4cbf-ba66-7dfd7b43c130	2025-05-14 02:58:37.342
138	anonymous-5914f725	5c187e33-9e03-4262-89e8-3b45cdbfa73a	2025-05-14 03:37:52.758
139	anonymous-097a6823	732a502a-ff4d-4fd2-80ed-a2c61f7bbb69	2025-05-14 04:16:34.348
140	anonymous-a28757e5	148ceff0-ea6f-4b4e-80b1-e0639a94a605	2025-05-14 04:51:10.952
141	anonymous-25fc3bc8	351f13b0-ee50-4eb1-ba25-492e25f2781b	2025-05-14 05:40:47.457
142	anonymous-a2dc4788	7c2ef5e8-e082-4889-b1dc-e0fe2cec9ab0	2025-05-14 06:51:12.174
143	anonymous-ec8e9986	b6427eb1-d74b-4b50-8901-7569db492767	2025-05-14 06:55:40.278
144	anonymous-2700cd45	95ad4a01-5540-4640-9953-af339efe227d	2025-05-14 07:16:30.219
145	anonymous-71166c7a	c04db496-7152-4f5a-88d7-c466a633eaa9	2025-05-14 09:20:33.781
146	anonymous-69a842db	d04371ef-d47e-4892-b2c0-56546ff1d834	2025-05-14 10:18:30.952
147	anonymous-3df6f662	767f6fc5-bc9a-4b38-b49e-4017639deb15	2025-05-14 11:06:27.202
148	anonymous-c29a1398	35e0e24c-d832-4d06-81e9-d343e9e6cb52	2025-05-14 12:09:37.083
149	anonymous-26e1b44e	80ea7d1a-7099-4709-8a17-acf07c699822	2025-05-14 12:33:40.904
150	anonymous-cbbc2b1c	b9f1d2fa-f0b4-4c2c-8c23-1f5bb3e732d0	2025-05-14 13:02:32.228
151	anonymous-f3917c25	7850c605-386e-4f05-93e0-432aaa41b995	2025-05-14 13:05:21.484
152	anonymous-8e783b53	5f127180-0b59-4614-9b10-99d1efc16723	2025-05-14 13:06:33.53
153	anonymous-f350930f	8d48c1b2-1464-42be-b6e1-cede4c5ea19b	2025-05-14 13:13:03.602
154	anonymous-e04f1c9a	b9a62e0a-0ddc-4164-9bdb-14c5e29b75c7	2025-05-14 13:23:35.843
155	anonymous-750251cc	03cc6562-705a-444e-8bb4-fe8aba68d759	2025-05-14 14:08:23.231
156	anonymous-5ea87bb8	76f91230-14cc-49c3-843e-b8f57f662e03	2025-05-14 14:27:24.574
157	anonymous-640c00df	ada26f80-ddbb-47c5-b747-6c9c7e3b8ba8	2025-05-14 15:08:15.799
158	anonymous-4dee5466	396197a1-2d11-4916-baf5-cc4d8d229e77	2025-05-14 15:38:29.738
159	anonymous-37585321	af7f8d91-9ae2-4199-b2b0-7c1bca56e01d	2025-05-14 15:58:24.08
160	anonymous-ea8b60a8	6ceb2a24-90b7-421f-a654-af89b5bc0379	2025-05-14 16:14:42.051
161	anonymous-5293163e	261fafe2-282f-4d38-b8d6-355cc39081ce	2025-05-14 16:54:12.919
162	anonymous-630ecca5	9b1e577e-376c-4320-945e-4e415ff88422	2025-05-14 17:14:41.652
163	anonymous-7759446c	c075bddf-43d3-4c41-bd05-6d30989713ad	2025-05-14 17:36:06.213
164	anonymous-873b32ea	3a11b935-cd13-416f-8a3c-7f5ca68ca66e	2025-05-14 18:04:14.423
165	anonymous-5a2109d9	c4e73d80-61fc-4967-8b77-8b9859db4de4	2025-05-14 18:26:31.389
166	anonymous-cc7ac540	bb990f89-4943-49fc-a43b-3c28f3ceb274	2025-05-14 18:31:04.706
167	anonymous-b51d2f3a	d4336ae4-7fa5-45bf-96a8-22408f770fcb	2025-05-14 19:18:16.74
168	anonymous-dc0cba6c	e7533da2-c67f-453a-bd98-42b6ad5d4574	2025-05-14 19:32:38.006
169	anonymous-4766d26b	8c2a1aad-90e7-4335-81cc-cb7d8a00ffc1	2025-05-14 20:50:34.873
170	anonymous-0f102084	dd095a73-341a-4c20-8344-28153d07faa8	2025-05-14 21:06:19.771
171	anonymous-32f5fcda	96354d22-3aeb-4582-88c2-6cccd843395d	2025-05-14 21:24:54.479
172	anonymous-0838219e	030be760-d3c3-4e2e-93c1-68a43c4e117d	2025-05-14 22:39:17.369
173	anonymous-55ad2d9e	9280753f-6099-4b6a-8ed1-6ea8c501a59b	2025-05-14 23:11:08.782
175	anonymous-999902d3	a5da2c5b-bd49-44d7-87ac-3a2e826c0b35	2025-05-14 23:19:24.425
174	anonymous-445705ca	74d9fca1-4d9e-4e76-88cf-9220848c3314	2025-05-14 23:19:24.429
176	anonymous-25a1075a	23a3ae24-3b1b-401e-97b5-e62e2db99051	2025-05-14 23:19:24.469
177	anonymous-d2712290	e925096c-672c-4b9a-8755-0663c7632971	2025-05-14 23:19:24.44
178	anonymous-ccb77e8d	62c56922-6911-4273-a0cc-346bebb860b3	2025-05-14 23:19:24.482
179	anonymous-679b586b	60b6f55c-141b-419f-860e-3c3a14d3ef8a	2025-05-14 23:19:24.488
180	anonymous-17154060	b434098d-217b-4c9e-a2bd-11ed2e7e1e8d	2025-05-14 23:19:24.564
181	anonymous-55f13b8b	4bc134a7-2fb7-445a-9a3b-b04d2cf09a7e	2025-05-14 23:19:24.545
182	anonymous-a21f72c5	a6fc2971-a7f1-4809-9ca6-008cf9c9e9e0	2025-05-14 23:20:04.063
183	anonymous-a74af376	9288cdfc-3366-49f9-8549-7c4dcc1ab514	2025-05-14 23:20:04.07
184	anonymous-27e19222	f487e0ce-b591-4192-8499-11ee286a1d3d	2025-05-14 23:20:04.067
185	anonymous-73fedbd3	1228990a-02af-487b-98be-3d4739c10874	2025-05-14 23:20:04.069
186	anonymous-af675e72	eb9e6935-e045-4580-aea4-aa1914eea702	2025-05-14 23:20:44.92
187	anonymous-206bab70	c5d2e2b4-c532-4192-b94e-e77943e835f1	2025-05-14 23:20:49.743
188	anonymous-bf462c4d	6663d839-2f9f-4773-876b-d7db5aec9be7	2025-05-14 23:24:59.63
189	anonymous-63b50ee8	0721cde5-b92a-49da-a3ad-9fd0d3d4f955	2025-05-15 00:06:05.198
190	anonymous-59b53265	6b6ad145-b0d0-4398-a16f-cafedcebf8f4	2025-05-15 00:40:34.519
191	anonymous-4b50a208	87abc24b-0981-476a-b5a9-eae18cfa1e8a	2025-05-15 00:42:28.89
192	anonymous-ea940d2e	8c54c70a-c18b-4010-9ae8-a7aec9266fd1	2025-05-15 00:42:28.93
193	anonymous-356d9e2c	17a0fba7-7938-4ef6-8c13-4e79836e2b22	2025-05-15 00:42:29.182
194	anonymous-94dd4149	9247980f-a3f8-47cd-beab-a86e7db05b96	2025-05-15 00:42:29.341
195	anonymous-b92c1af0	e93c4b67-6be3-4c89-8c9d-ccfc254fd361	2025-05-15 00:42:32.917
196	anonymous-bf42c3f1	e91b6d11-5f10-4f67-a337-ec3fda724321	2025-05-15 00:42:33.284
197	anonymous-481069a2	bda258e1-ed37-4b60-8c51-7a48f10d90cd	2025-05-15 00:42:33.303
198	anonymous-debef26f	a9de186a-19c1-4785-9e01-82e619d49f56	2025-05-15 00:42:33.323
199	anonymous-ef398178	5e086e2a-65e6-4769-9866-f7beb0e19130	2025-05-15 00:42:33.328
200	anonymous-3eeb1be3	dbabe148-8ab4-4d48-ae45-80f417f1cadf	2025-05-15 00:42:33.417
201	anonymous-2b6768ff	90ca59ad-a8cb-4d2c-b57e-acaa51eddf41	2025-05-15 00:42:33.478
202	anonymous-d6ec83e9	a1f65137-9b66-4690-bd84-7b49f26d8a6e	2025-05-15 00:42:33.476
203	anonymous-af0bf77c	084fd4fa-6749-4a75-8776-6b36964cce9d	2025-05-15 00:42:33.519
204	anonymous-2e54322f	a3f29c67-df52-4f03-8692-7112a7fd5f62	2025-05-15 00:42:33.523
205	anonymous-6c3d390e	415dd2e7-074e-4e28-aa14-c35d13746763	2025-05-15 00:42:33.526
206	anonymous-2473e905	018d7a73-217c-4c1e-8b4b-68302baedf47	2025-05-15 00:42:33.639
207	anonymous-60d2cad1	513b88ed-6d5f-46c4-b585-853a393bc8c0	2025-05-15 00:42:33.642
208	anonymous-431e3c49	65076bb4-01db-45b9-9144-c344a61f84b1	2025-05-15 00:42:33.648
209	anonymous-949b67fe	5af593d4-7fae-4a37-96da-b3d534399cc2	2025-05-15 00:42:33.65
210	anonymous-ad340b39	4cb24377-e906-40f7-a161-afe5da4372ae	2025-05-15 00:42:33.747
211	anonymous-f0b71e7a	62802d0f-e04e-4cb5-91f3-5a05486c64ee	2025-05-15 00:42:33.786
212	anonymous-2a822f8f	57dc2db9-8fcd-4d88-9313-8eca2e92a374	2025-05-15 00:42:33.827
217	anonymous-19164dab	43b1983f-751b-483a-92ca-2ac9c55a89a9	2025-05-15 00:42:34.094
219	anonymous-f21659d4	dd134bc4-dc44-4701-8c33-63fa95cb14db	2025-05-15 00:42:34.169
226	anonymous-80c332d2	1d2a3ee9-3a95-4596-a142-d64e9d014c3c	2025-05-15 00:42:34.34
213	anonymous-829f84c5	95c34d6d-581a-46cd-8e07-9fe382269cd3	2025-05-15 00:42:33.848
214	anonymous-819f8e38	732eecf4-daa3-44fb-823b-76283e6f87ea	2025-05-15 00:42:33.895
215	anonymous-6aad99de	7d88e89c-0083-462d-abc5-73db426358e7	2025-05-15 00:42:33.967
216	anonymous-e4247e6d	22e386aa-ebb6-47de-b044-4644c347cc2c	2025-05-15 00:42:34.064
218	anonymous-e5f3def4	a038705c-ed32-40f2-b28a-004aa8a96e55	2025-05-15 00:42:34.132
220	anonymous-f0677e32	0e91fe7c-3bd6-4b7e-9fda-c000358e2103	2025-05-15 00:42:34.204
222	anonymous-ac7f0d48	db9b2765-a117-491a-8818-2cae91cc65c5	2025-05-15 00:42:34.255
224	anonymous-164d2761	e8b13dbf-64d1-44a7-a794-44b49c3903fe	2025-05-15 00:42:34.336
221	anonymous-86b0dc79	20008789-3074-4d21-ab3b-e9c11555595d	2025-05-15 00:42:34.209
223	anonymous-347e6e61	6546a7ca-16cc-4c08-ae48-73cbbde88a6a	2025-05-15 00:42:34.261
225	anonymous-b4d73e3b	61f67ba0-a726-4ff9-adcd-d8cb00e2ad39	2025-05-15 00:42:34.339
227	anonymous-be0a82a5	b089fb4a-ebab-49fb-825d-b261a2711371	2025-05-15 00:42:34.343
228	anonymous-c8ffcd98	b3ec49d2-2513-48ff-bb49-bf819f2cace7	2025-05-15 00:44:04.773
229	anonymous-da1a7b96	9b7cb9f1-0161-4300-928f-fc93ba99fb10	2025-05-15 00:44:10.641
230	anonymous-cf0b6296	9d8575fd-9b16-4b34-94a8-3589a1c1336a	2025-05-15 00:44:10.649
231	anonymous-ab2e4a5b	e4ae5b4d-276f-4d1c-b656-2c3304197769	2025-05-15 00:44:24.053
232	anonymous-0af65925	68e2edb9-7305-4450-b6eb-7d1688bf23b6	2025-05-15 00:44:25.193
233	anonymous-99f4acc6	4bd7cbe1-629d-43ad-81d7-4121cbdf17f7	2025-05-15 00:44:28.261
234	anonymous-822b83a3	999be159-2653-42d2-8382-7b406ba282ec	2025-05-15 00:44:28.292
235	anonymous-8bb5c3fd	d8d9eeb4-8ddb-4aad-851c-8b74fcddccc9	2025-05-15 00:44:28.494
236	anonymous-17e3d4f5	39c3e3b6-1be4-4487-8ab1-c4083996ec51	2025-05-15 00:44:28.498
237	anonymous-d159fdab	b4c27123-6bf8-497c-96a5-6c3b93d75e4e	2025-05-15 00:44:28.614
238	anonymous-ef2c9511	27aedbb4-c11f-4e5c-960a-4626c7e67041	2025-05-15 00:44:28.618
239	anonymous-9079b83a	1968233a-4be5-4a07-89f4-b8805d96b542	2025-05-15 00:44:28.619
240	anonymous-48fcfb26	9ac35d81-2e40-4526-974a-ae66b9baefb0	2025-05-15 00:44:28.626
241	anonymous-71a7ad76	8037a68f-6cc9-4d23-a437-1ad5cb2584c9	2025-05-15 00:44:28.721
242	anonymous-b2530a15	03578b09-0640-4770-89ea-6b0410c4eeb5	2025-05-15 00:44:28.727
243	anonymous-46496020	6395bdb3-aca6-41a5-84ff-b8acf9a749b7	2025-05-15 01:39:36.71
244	anonymous-b08078d4	b28dd1a2-0887-449b-bb2a-61ba0d6171bd	2025-05-15 01:40:45.217
245	anonymous-e8f2888c	24aa641d-38fe-4ae0-aa79-49e5a72f949b	2025-05-15 01:40:46.444
246	anonymous-a0adbb24	25d6b3cb-5feb-4e53-8928-371bfb7465ed	2025-05-15 01:40:46.448
247	anonymous-b4ba85d5	420e0f44-3550-4007-b849-afc5434ba63c	2025-05-15 01:40:47.271
248	anonymous-436c70b9	5e47ebba-dbc1-4830-bbe3-c598de0a96c2	2025-05-15 01:40:47.337
249	anonymous-be7be450	baea0349-c647-42e0-a8a1-915f6392e82b	2025-05-15 01:40:47.336
250	anonymous-2c8fd1c5	8bc6f59a-c974-4a05-b892-a04934aab869	2025-05-15 01:40:47.436
251	anonymous-6486f57c	667fc622-0a98-4782-aa32-72f30d1fe726	2025-05-15 01:40:47.437
252	anonymous-4b43b9b8	a704e750-ae4a-4041-b398-5efbfd452048	2025-05-15 01:40:47.456
253	anonymous-9c8e1643	09170a4e-14af-4412-bdc5-5303d0f51c25	2025-05-15 01:40:47.555
254	anonymous-8a400a57	5529cd56-3b41-44d8-95cf-0ea5bc143f10	2025-05-15 01:40:47.604
255	anonymous-5171d90f	6feabd95-03a9-4e35-8c54-0f2929892c33	2025-05-15 01:40:48.789
256	anonymous-3d45c392	062b40af-6ddd-48b7-bec4-ce844ba8fda9	2025-05-15 01:40:49.189
257	anonymous-b8458f4f	e98f1753-3f07-4af4-bb8b-1c31d8388e3d	2025-05-15 01:40:49.352
258	anonymous-6eb0056e	181db2ff-c5fb-4ed7-9c60-cc0019af2c26	2025-05-15 01:40:49.357
259	anonymous-eafc849f	e6128ae8-d297-4624-b279-e7e04f8230d0	2025-05-15 01:40:49.436
260	anonymous-542e583a	1b273098-7948-463e-a03f-f3283e6e97df	2025-05-15 01:40:49.438
261	anonymous-8f71bbbf	d3838be3-009d-4f21-a2fa-858e0de8e366	2025-05-15 01:40:49.357
262	anonymous-a15065c7	3235e53e-3921-4307-9ab7-f2280457813e	2025-05-15 01:40:49.484
263	anonymous-5c094c1c	893022ad-f4cf-4cfc-9a30-639404930a6f	2025-05-15 01:40:49.359
264	anonymous-4e4aab80	72d330dd-6eeb-469f-85f9-797143d6956f	2025-05-15 01:40:49.526
265	anonymous-21871bfd	de4136eb-83c6-43a2-9f26-ff332d22d57a	2025-05-15 01:40:49.525
266	anonymous-c0e63777	ccf69fe8-77f7-483f-8466-e578754e9bcd	2025-05-15 01:40:49.583
267	anonymous-8f7c2dc5	d5fb02b2-2737-48e4-9f82-e61b14defc83	2025-05-15 01:40:49.581
268	anonymous-08d43919	afd6b207-de39-41bb-9a4e-ef7d3eba07ef	2025-05-15 01:40:49.607
269	anonymous-e5f059fd	fe2058dd-87d1-408c-80b6-7357dcca3959	2025-05-15 01:40:49.616
270	anonymous-5638c460	b4232fc3-66dc-48e7-9b52-71d3c7f649f1	2025-05-15 01:40:49.655
271	anonymous-7b276e60	4fb1cae2-c0f1-4615-aaad-30d0561d5cb3	2025-05-15 01:40:49.665
272	anonymous-6e02ce4d	a7ff075a-8361-45dd-9179-394dd1e502d2	2025-05-15 01:40:49.665
273	anonymous-3226a4db	be7c57a4-cac8-4882-b79f-26f36abe6d86	2025-05-15 01:40:49.7
274	anonymous-7a275296	fd404e93-d9f0-4e93-9ed4-bbd1dc0edd6a	2025-05-15 01:40:49.7
275	anonymous-0562e8f4	787f3ba3-3870-4f6b-a652-bad28f94fd0b	2025-05-15 01:40:49.465
276	anonymous-1886f8e1	93f9f0a2-bc6e-4c82-9eaa-3088ba874ac8	2025-05-15 01:40:49.791
277	anonymous-ddc007cc	546a2384-c916-4202-84eb-339d622564d3	2025-05-15 01:40:49.81
278	anonymous-5e54901a	1ed6d89d-77ae-47a2-90cf-30bd7653f809	2025-05-15 01:40:49.812
279	anonymous-60b6556c	ffbe75b0-f5ae-4626-a0da-4834fc6fda10	2025-05-15 01:40:49.845
280	anonymous-88d398c5	aba1212e-3998-422f-bd9b-ab842e98c77f	2025-05-15 01:40:49.846
281	anonymous-34bae6a1	ec17bb37-44b4-4d8f-9d7b-64d4bf9ffc86	2025-05-15 01:40:49.887
282	anonymous-b3f7876e	ab532cb6-740f-4f34-b09b-850e7a5591ba	2025-05-15 01:40:49.9
283	anonymous-3c2dc000	3fe7eef3-99f4-4cc4-b779-a3ba99584deb	2025-05-15 01:40:49.918
284	anonymous-e7f99086	bb287b8d-e0cf-47d3-973b-3c8f835aa701	2025-05-15 01:40:49.929
285	anonymous-6993d7ea	244886de-69dc-4383-95de-598067ca705f	2025-05-15 01:40:51.145
286	anonymous-1487a399	47829dae-05fb-4248-a838-4930b55641b8	2025-05-15 01:40:53.704
287	anonymous-dae84eb6	0c6d4d5e-2d15-491a-bfe6-5242130b618f	2025-05-15 02:00:19.855
288	anonymous-4e4b171a	23eee9eb-8bbe-499b-aa73-e7634b148a16	2025-05-15 02:04:55.153
289	anonymous-adfe6de5	bfbc0b5e-35be-4028-9c4a-7d028f565a92	2025-05-15 02:34:31.779
290	anonymous-489fd97d	d226aa86-8245-4115-a273-8ed480781959	2025-05-15 03:24:17.294
291	anonymous-3bfc3989	2c3e4a30-fb8f-44e4-a640-4c22cf7b3799	2025-05-15 04:14:12.44
292	anonymous-1b333214	6ca52b01-1349-4177-a243-627105677aa8	2025-05-15 04:19:11.766
293	anonymous-19e0d847	1ccef06a-8e07-4d63-a838-88ecfe646285	2025-05-15 04:39:25.182
294	anonymous-0f5888ab	0edc0841-fe04-4ab0-93dd-f311414e9839	2025-05-15 05:13:25.791
295	anonymous-0bc6c2d2	50f01dfa-e0d9-4452-8992-87ffdf2e488e	2025-05-15 05:19:15.093
296	anonymous-bd011d12	61f2b984-5829-41ed-a207-0fbfdf33af1f	2025-05-15 06:04:28.758
297	anonymous-7677fa9e	ba395fe3-94ef-410f-902a-1c1ee26cb8a1	2025-05-15 06:43:27.825
298	anonymous-926fca85	38695734-81e8-448e-8313-f645ab64403f	2025-05-15 07:09:16.124
299	anonymous-76889ce3	c1ba3e95-10c2-4768-b78e-304ecb8b8bfb	2025-05-15 07:19:15.527
300	anonymous-d825edd5	c66cc6d7-9eab-49d7-b788-3e9519d6149c	2025-05-15 08:19:25.41
301	anonymous-155faf4c	2a822381-cac6-4bf4-a421-e2788b326759	2025-05-15 08:40:34.097
302	anonymous-00077a6f	2592b923-fd43-49dc-9cb1-07b89e51f68d	2025-05-15 09:34:24.833
303	anonymous-405f1404	339fdff1-dced-482e-aee7-c744dd122074	2025-05-15 10:25:25.363
304	anonymous-fa597ff6	dada042c-ade3-4097-a1db-b380477ac64d	2025-05-15 10:35:25.712
305	anonymous-a29ca2eb	97388e33-dc7b-4588-90f5-dbe9eb6efbe7	2025-05-15 11:13:42.979
306	anonymous-ec7d99dd	58e365a3-69c2-437c-8878-5b62e1efa87e	2025-05-15 11:55:02.771
307	anonymous-9a91180a	bbc454df-1cc7-4668-bb33-cb6bc48608ec	2025-05-15 11:57:15.271
308	anonymous-8855f25d	4fb8542f-4826-49e0-80be-ce4b58a97c21	2025-05-15 12:19:13.009
309	anonymous-319c630a	8271ec15-b097-4a2d-bef7-73444a834e28	2025-05-15 12:32:25.508
310	anonymous-6661179f	6a9934e4-10b5-48ac-b675-326a28356613	2025-05-15 12:41:50.721
311	anonymous-b0fc8260	9ef83b28-b02d-4b56-90a8-105dc0a66d21	2025-05-15 13:22:30.329
312	anonymous-47ed9f64	42ef5fe5-fe42-4aeb-a945-5f09ead3298b	2025-05-15 13:43:11.828
313	anonymous-ebfe95cc	89e902f1-9dfc-480a-a1d4-132e4c9db5c2	2025-05-15 14:09:10.862
314	anonymous-7ebc95fe	15159938-8fa3-46ab-830d-e4f4d3552906	2025-05-15 14:24:08.76
315	anonymous-79578d85	0835afd1-d598-4994-92c9-954ec03efe0b	2025-05-15 14:34:14.971
316	anonymous-2aeae3cb	3812b15a-71e8-4dee-a0dc-310af9bcc042	2025-05-15 15:18:45.967
317	anonymous-85edcccc	ce8904d7-fe20-444e-8c8b-61dc406b5d30	2025-05-15 15:51:19.962
318	anonymous-cebc209b	c9e3364f-d683-4f15-aca9-4e07e7c107d4	2025-05-15 16:29:41.65
319	anonymous-a60c3bd2	e40f0e42-f2b3-4fb3-8f9f-1328e4b7f98a	2025-05-15 17:16:10.577
320	anonymous-efa7e8b0	153e19eb-ddfc-498f-a967-30992340ea4a	2025-05-15 18:04:53.51
321	anonymous-c38b097a	455c2671-5875-4b5c-88a7-f94f8e06e72b	2025-05-15 18:59:18.206
322	anonymous-23b31243	11818fe2-8996-48da-9e76-f76dad1b02b5	2025-05-15 19:32:27.259
323	anonymous-1ec27ffc	6ea85448-f29e-46f4-9a64-79ee561127b6	2025-05-15 20:11:35.663
324	anonymous-cb362b9c	46bb5195-0f92-494c-9c9d-09e3929df0a0	2025-05-15 21:04:59.761
325	anonymous-ced33532	e101d880-f9fe-414f-96da-696777bea716	2025-05-15 21:28:27.572
326	anonymous-e772b078	978a99d8-37d9-431f-9fda-496e07795554	2025-05-15 21:51:14.588
327	anonymous-d3daa838	dfa79542-6999-4906-87eb-97c3338a3e0c	2025-05-15 23:17:06.238
328	anonymous-d2579bdd	048acec7-6cac-402f-829f-2dcc8f7fd5b2	2025-05-15 23:51:03.534
329	anonymous-c888bed5	b1810a66-d3b6-4354-8b07-15595d54dd7b	2025-05-16 00:10:03.178
330	anonymous-c259949f	3f324f5b-0643-4b45-8d4b-99c30d3918ee	2025-05-16 00:53:07.085
331	anonymous-c7a66347	bbc5d308-8f15-4e08-9e96-6c578f06b9df	2025-05-16 01:00:33.577
332	anonymous-2efe3322	837bbf53-34b2-4d45-84ba-cdbda24c1c64	2025-05-16 01:00:38.996
333	anonymous-37f3e5da	97145f25-d524-4b03-b53e-4106ab928309	2025-05-16 01:00:39.097
334	anonymous-383a808f	ff4754f7-cb6e-42f8-a885-cd1a10a8472c	2025-05-16 01:50:01.055
335	anonymous-9c904ecb	ca7b52f2-6b04-4c97-8f41-4817cc637d69	2025-05-16 02:09:40.928
336	anonymous-f5d7e214	13acc7f2-9c14-4d45-8eca-a21e60dfd381	2025-05-16 02:38:59.292
337	anonymous-64456181	10d5cbb6-5017-4eab-a659-e120cf6ed716	2025-05-16 02:39:16.116
338	anonymous-28007d52	86751fef-cb10-44e3-8746-c92fc8242781	2025-05-16 03:01:25.872
339	anonymous-141cc1fa	855b12ae-4200-4995-b178-29a1f7dd22f8	2025-05-16 04:06:35.625
340	anonymous-b4d27b9c	97eaf57d-51c4-48c9-8343-78519b954c38	2025-05-16 04:06:30.238
341	anonymous-43503f01	cebf5ab8-a9a2-4381-bbd0-d6f767585273	2025-05-16 04:23:40.291
342	anonymous-14d10f00	2223fee4-a729-48c3-873e-291added11af	2025-05-16 04:53:12.326
343	anonymous-d9d5ed3b	8eb2022c-5825-4820-8663-5cef7ee6600f	2025-05-16 04:58:38.666
344	anonymous-62bdaf9e	6edd0e3c-2c74-42fc-90d4-1dfa6fe24526	2025-05-16 04:58:47.044
345	anonymous-08ead0d9	48349497-2041-4335-b4bd-57ce581a0d9d	2025-05-16 05:05:36.591
346	anonymous-0ba89cd7	925689eb-d13b-4cb4-b9fb-ec5cb2ea2b67	2025-05-16 05:05:49.935
347	anonymous-70fbbbea	95696c8a-e052-4bc7-a779-f61c0469910b	2025-05-16 05:14:27.136
348	anonymous-90bf30bf	b0638809-4f91-445e-9d2e-1ae63105ca3c	2025-05-16 05:49:03.224
349	anonymous-858ccdba	c9ee4c28-d886-4226-96c7-5e6590351a98	2025-05-16 06:26:43.594
350	anonymous-81683dc2	57c8dcb3-2c86-45d9-9f7c-640fe34b3036	2025-05-16 07:36:23.641
351	anonymous-066dda7e	23bedc3c-fc9c-477a-8802-739af7de328c	2025-05-16 09:46:05.107
352	anonymous-80434e34	03210cec-5bc6-42a6-a771-ee96fc4a3118	2025-05-16 10:25:16.162
353	anonymous-9b44a9be	ec34eb80-ca51-4fbe-836e-8383b7be0562	2025-05-16 11:09:14.002
354	anonymous-3cc4092f	6219275f-d0ec-47c4-a4fa-b19a882fba64	2025-05-16 12:37:50.045
355	anonymous-33e254e2	180eada1-452f-4e66-99a9-c2213d8b7dbd	2025-05-16 13:32:20.32
356	anonymous-28f73fd4	093862fa-2a21-47ed-a654-4f77b1e193ba	2025-05-16 14:55:52.218
357	anonymous-f8d660c9	fb84afdc-f0af-4e1f-86f0-3a8ee1af33f6	2025-05-16 16:06:26.943
358	anonymous-219decce	563a4919-f30c-40df-8dff-04af9e76ce84	2025-05-16 16:52:47.452
359	anonymous-00861114	4c2c8219-29fa-4823-8f07-f1030c1bf591	2025-05-16 17:01:15.945
360	anonymous-4898d6f5	f7771762-8bf2-4f7d-89f4-71f8c97b3aad	2025-05-16 17:26:20.302
361	anonymous-ffbf920e	150b9c35-3e4c-4741-a0fc-e211ce56fa6f	2025-05-16 17:54:13.023
362	anonymous-0e31069c	2e2a5836-60f1-4bb8-8ce2-08ce5931bf47	2025-05-16 18:15:36.866
363	anonymous-a853ce54	99437d4f-183f-465e-bb88-1db5a323098d	2025-05-16 19:36:46.403
364	anonymous-7b95d772	633755aa-71f2-42f2-a99c-b81fa7fb76e5	2025-05-16 21:00:31.167
365	anonymous-edb975d5	5b34450c-d49a-45d5-aac7-1820040a39d9	2025-05-16 22:33:00.085
366	anonymous-7d678ac6	1af5eb67-3170-4f03-8839-51f17ff36069	2025-05-17 00:09:01.423
367	anonymous-967ad0fd	60d0f899-1b61-40f1-bece-ea26caa9f2bd	2025-05-17 01:16:40.293
368	anonymous-3ab0f36d	a3e9d05d-2aaf-46eb-817f-e9898af5b0a1	2025-05-17 01:39:04.347
369	anonymous-606b1bfa	97434d58-7441-4e1f-a868-4caed10d8ac5	2025-05-17 02:01:00.792
370	anonymous-7266d96c	64de8fa1-758a-4f55-b4d1-0a5374a1d680	2025-05-17 03:00:05.755
371	anonymous-996aad39	3020f289-3c44-49ad-86cb-1a78f9faf64c	2025-05-17 03:46:39.692
372	anonymous-1ab3837a	a952bd94-d6a6-4c64-8699-250da4d0d8e6	2025-05-17 05:11:32.541
373	anonymous-37b2bd98	7b74a4a8-208f-482e-894f-b506252074b1	2025-05-17 05:51:53.559
374	anonymous-87cfa48f	a7c80f37-2bab-4ea4-9572-8bb19ff3351e	2025-05-17 08:02:31.689
375	anonymous-975e2cb8	cc8d73f3-8d1b-4916-95c9-ed9d1c1a560a	2025-05-17 08:50:25.834
376	anonymous-454ee336	c0000de5-1af0-4198-b935-b7358e025d07	2025-05-17 09:24:18.743
377	anonymous-d04d2894	4c91121c-a75b-4f6e-8c31-304ef3a5bcee	2025-05-17 11:04:26.308
378	anonymous-7a0b0014	cdc9287d-8c90-4df5-86d6-cb4bf13aea94	2025-05-17 11:29:35.949
379	anonymous-80b701a0	4f84d092-14c2-4166-9bad-da11181a8af1	2025-05-17 12:02:06.588
380	anonymous-f4bc3f82	167d2367-1682-44b1-9060-24792a4d7345	2025-05-17 13:16:14.536
381	anonymous-ca996f8d	8c66935f-c16f-4082-a5ce-a68e32d65c59	2025-05-17 13:41:24.274
382	anonymous-359627d8	e3b04269-21e5-4218-b41a-b51c18873a97	2025-05-17 14:48:37.993
383	anonymous-a723f05e	04df3ed6-6c0e-4c48-b3c7-2121e02d3923	2025-05-17 15:14:29.881
384	anonymous-46ef3578	a038b751-1412-49dd-aff0-099e02db8e38	2025-05-17 15:51:00.723
385	anonymous-cb695050	132963f7-43dc-493c-b4cf-81576c6c5028	2025-05-17 16:24:38.973
386	anonymous-ac33b016	466427f1-2548-4571-bbc4-09704a28db2e	2025-05-17 17:25:22.388
387	anonymous-101e33dd	82cbbd89-8e7c-4bfc-9f2d-869863ba2991	2025-05-17 17:28:10.099
388	anonymous-bb3e325f	6cab40bc-098c-49f5-b5b9-9ad8682951de	2025-05-17 17:29:35.796
389	anonymous-ee9e5078	b21de0a1-c5ec-4fdf-bd56-d44ef5a18ff8	2025-05-17 17:33:54.013
390	anonymous-2ce57235	82ee42e4-4dd3-494a-aa84-7a43af9b174a	2025-05-17 17:36:04.33
391	anonymous-18753fe8	f0d7ca53-bd50-41bb-ba62-c561a46dd5cd	2025-05-17 17:42:18.149
392	anonymous-fafcdbed	88ea9442-07d9-4857-a8db-770a015b1967	2025-05-17 18:46:07.606
393	anonymous-f9bd2f66	0b83ca43-d27f-494d-b6fb-11b0f3d300a7	2025-05-17 20:31:25.628
394	anonymous-fe47b602	a8597366-ad38-4348-8235-96824c5de683	2025-05-17 21:44:39.332
395	anonymous-a56ab68a	77bedeab-f86a-4f27-8b7a-dcb013a24666	2025-05-17 22:00:31.26
396	anonymous-a2743a29	56fc7a38-0a1a-4e1d-a57b-ed207d76e4b4	2025-05-17 22:19:44.004
397	anonymous-0e6f9cdc	b8219167-177a-4987-85dd-116e45b4cce7	2025-05-17 22:19:44.677
398	anonymous-605d169d	fa498bc0-ce46-4c06-9fb5-800efb8d7f28	2025-05-17 22:21:34.52
399	anonymous-9644c8ce	8aff0371-8420-43c4-b7d9-1ea2b3bf87f6	2025-05-17 22:25:50.778
400	anonymous-802119b3	8c51bd85-93b5-4bf5-b1dd-fc322bf85981	2025-05-17 22:28:07.052
401	anonymous-cbbdc735	572cbba5-1253-4724-9bb5-fa433c8b517c	2025-05-17 22:32:38.469
402	anonymous-6765bb40	5c6070a5-0971-43c4-b30a-d776ff6692fa	2025-05-17 22:34:16.798
403	anonymous-27f85611	9280a4b8-d73d-44cf-a7bb-78ccef21f08a	2025-05-17 22:49:35.943
404	anonymous-23c6b55b	40f92c0f-7cce-43f0-be0c-017d48ebd4df	2025-05-17 22:51:27.033
405	anonymous-c3cd022b	a01ab808-efe4-4d07-b933-b1b1ee724e3b	2025-05-18 00:49:10.255
406	anonymous-68d05d87	0c19ffd2-1e94-4a73-8c08-3c04be12f20f	2025-05-18 02:19:38.098
407	anonymous-ab68c2e7	0d1fc583-fe62-4ff4-88a5-b628013cbd44	2025-05-18 03:09:17.849
408	anonymous-089ca546	f9e9aea2-1973-4953-b0da-79c5dceb6381	2025-05-18 03:59:18.01
409	anonymous-fd581dab	2b1cb4d1-e2fd-4db4-9a27-b6bb1f5b0595	2025-05-18 05:39:55.851
410	anonymous-3930f53e	a4704f1c-897e-430f-9fdb-64cb1242d2e2	2025-05-18 08:09:05.084
411	anonymous-a847717a	f9119716-3958-4c7a-b0eb-1466cd1dbffa	2025-05-18 09:36:27.976
412	anonymous-f42a5c51	f538ff90-632f-4f68-89e6-cee48ac38ebd	2025-05-18 10:25:29.617
413	anonymous-81246279	c1f6ee8a-24ee-433d-8855-06735821e0c8	2025-05-18 10:55:07.339
414	anonymous-3bebd937	8795d3d2-2ca2-49ee-a5f3-ced378e5c9df	2025-05-18 12:01:19.444
415	anonymous-0687e98d	df9b1e3a-c91b-42fe-964c-f7e8270148d5	2025-05-18 12:31:53.116
416	anonymous-40f51240	6d7babf1-107e-4f8e-b35f-4045e7290ec5	2025-05-18 14:20:17.945
417	anonymous-4027b0a8	332d0d42-a101-4093-ac75-aa8784f679e2	2025-05-18 15:20:29.136
418	anonymous-084a0dc9	e76c6358-2fca-4e58-9446-0c738b317a13	2025-05-18 15:55:07.448
419	anonymous-3f28256a	aa67f792-059e-4ed9-b158-a391d5e7e2cc	2025-05-18 19:01:26.8
420	anonymous-bea7f2ba	c6c980f2-218e-4f1b-bdd5-6558ad47c555	2025-05-18 20:10:46.692
421	anonymous-dba67b18	051c4e9a-2a54-4cf4-944c-cdf112af271a	2025-05-18 21:53:56.475
422	anonymous-aa0e4f3b	0b906336-eac8-478e-bb4a-0b108402ca86	2025-05-18 22:10:01.356
423	anonymous-9919634c	0b152a1e-f0c5-4e06-8e0f-202b739d7801	2025-05-18 23:57:50.121
424	anonymous-d47100a0	e5cb7652-31e9-4bf3-9dee-0101d9f70bd5	2025-05-19 00:35:27.384
425	anonymous-f2dcf472	15992dab-e0b4-41a4-af34-1fff299e2771	2025-05-19 01:30:18.521
426	anonymous-643e8ffd	63acbcb9-114a-4843-a9b3-f27f8ed0c11e	2025-05-19 05:04:09.983
427	anonymous-f1bfd8aa	87408207-ece6-4b35-8028-9abd0e9be745	2025-05-19 06:24:32.459
428	anonymous-f342c762	06ec9cc5-802b-4f96-ad88-c503ce60e443	2025-05-19 06:45:18.521
429	anonymous-1e2422c7	8d0fdc89-1b22-41b8-9f9c-f964613bae9e	2025-05-19 07:16:32.61
430	anonymous-ebded732	16e9ac25-aec5-4a50-9379-019b6c7bd1a3	2025-05-19 08:19:09.733
431	anonymous-c9a9b30b	c5525518-0bc5-4ffc-8853-19e7c979b28b	2025-05-19 10:51:43.962
432	anonymous-2dba4377	bd7661f1-238e-4d98-8afc-8c8655569892	2025-05-19 11:11:50.546
433	anonymous-f1b72c9b	78ea8a09-3372-44c3-be31-40d0b02c374a	2025-05-19 11:28:17.707
434	anonymous-2ab95987	cd646f84-ab78-4162-99d6-e63ca421d321	2025-05-19 11:48:47.15
435	anonymous-af476ff0	ef6791a2-e637-42b6-b40c-f0f6a13956d7	2025-05-19 12:35:44.23
436	anonymous-f774f24e	931b5e21-aaed-4545-a7da-a87a1471a6f2	2025-05-19 14:52:10.624
437	anonymous-ef63121f	3d7e106b-aeb9-4b10-8237-c78d3586c2f0	2025-05-19 15:32:07.725
438	anonymous-768ba002	146bf693-cad7-4da3-b1de-a2e710392bf2	2025-05-19 16:21:18.467
439	anonymous-6688a9f1	2757d8f4-3eb9-49d3-a1ef-918f800f2319	2025-05-19 17:27:53.973
440	anonymous-24c8b65f	cba99e72-56c2-474b-8f2f-6c83399b3f37	2025-05-19 19:20:36.587
441	anonymous-90c0e117	0f111c10-2605-4b3d-a53b-a958aa645444	2025-05-19 21:24:53.138
442	anonymous-3e0c8a43	d0e76769-bf42-476e-83d8-5c0673714808	2025-05-19 21:56:54.607
443	anonymous-a53fb4bb	1173050f-48ba-4cec-99f4-5f5676d3fac3	2025-05-19 22:30:13.101
444	anonymous-fd374744	e7198607-6059-430a-86a2-9591f8bc04df	2025-05-19 23:51:01.534
445	anonymous-463c78d0	00227e2c-8938-427f-a583-06c4251527ec	2025-05-20 03:51:53.064
446	anonymous-5202837a	fefa15e8-7810-467f-b446-af9abb77c972	2025-05-20 03:51:54.018
447	anonymous-a82b0237	57690e17-4854-4ba6-95da-935f1227f267	2025-05-20 03:58:05.422
448	anonymous-267dd306	7ef9aef8-4040-4ef8-9818-41cc4ea71584	2025-05-20 04:05:23.759
449	anonymous-d50dff35	ffccc0c7-fa30-4e41-b067-9f3b1ccd0556	2025-05-20 04:06:17.605
450	anonymous-cd302b43	89b08083-c324-42d3-b432-7c255fbce360	2025-05-20 04:23:13.413
451	anonymous-aa7993c1	064933be-e3b6-4ace-9cda-3b664d2b3d0d	2025-05-20 04:23:14.343
452	anonymous-4f032b43	cfd7de7c-55a7-4c65-ae58-430fad61e5eb	2025-05-20 04:23:14.347
453	anonymous-777382b4	c08db8fd-f9f2-4da3-bd1a-489150a6e244	2025-05-20 04:23:15.038
454	anonymous-97f62552	f0e29ef0-5be3-4d25-a390-ae633a9e2527	2025-05-20 04:23:15.29
455	anonymous-f544d68a	6b8402d0-4384-4a3d-8ad6-512747a625fd	2025-05-20 04:25:24.236
456	anonymous-467adaa0	0f5d39db-43de-4e37-9c21-b69a80210565	2025-05-20 04:25:25.359
457	anonymous-74927861	df0d4f06-708c-429a-a7f3-9982c0d952e1	2025-05-20 04:25:25.412
458	anonymous-c1f098bf	6b226106-c12b-469c-b0ea-252d7775e296	2025-05-20 04:25:25.693
459	anonymous-682d3233	6c0d1dac-e5ff-4ef6-9bb3-7e78072ff400	2025-05-20 04:25:25.927
460	anonymous-9a1e1e84	0e69d3ce-a75b-4c83-bfd4-08863d3f9dd0	2025-05-20 04:29:29.539
461	anonymous-8486754d	811ad0ac-00b3-4095-8bab-d51a45d3e307	2025-05-20 04:50:09.902
462	anonymous-5f163360	d23ee8ce-a81d-4497-9a0a-3ab7e36f21e3	2025-05-20 04:50:10.249
463	anonymous-69216038	ce965973-9c80-4b1c-95d3-b723932363e3	2025-05-20 05:29:48.304
464	anonymous-3c61511c	bd5c3a73-8a42-4648-b592-795b37efc134	2025-05-20 05:55:42.284
465	anonymous-1ecbcc13	9690ad4e-ea9f-470b-8773-cc57ebe8772a	2025-05-20 06:21:37.776
466	anonymous-ae21e59a	44f3a6f5-0388-4aae-a681-0558d8c60583	2025-05-20 06:50:55.704
467	anonymous-e6295459	7ae5f088-0ede-4a43-8fb6-d1005f55a56c	2025-05-20 07:26:52.194
468	anonymous-50a68e66	57a9dac3-f6bc-451c-837a-6cf417042a02	2025-05-20 07:50:29.049
469	anonymous-68d5ae93	43bd8b8b-bea1-4454-8bf0-d371fe7e2375	2025-05-20 08:10:27.091
470	anonymous-630e342c	74b3d4c4-c1e0-495e-a943-0fb9cdea18b5	2025-05-20 08:53:02.511
471	anonymous-676ee4d4	412bd100-dfa0-4658-8584-a340d3dc2a30	2025-05-20 10:04:41.128
472	anonymous-72e6713d	755a5dff-938e-4184-81b7-07766b97394b	2025-05-20 10:20:48.548
473	anonymous-49c86dc1	3b896069-7509-42de-8496-4bd8ead1a02a	2025-05-20 11:49:28.212
474	anonymous-46087771	33154feb-9910-4b82-9ae0-82d506ec322d	2025-05-20 12:56:19.471
475	anonymous-802e23b9	31dbc40f-2b1a-4725-9590-e06bfaf050f9	2025-05-20 13:19:18.699
476	anonymous-92e0a497	d6370f64-a04a-40c1-8774-f828af4949e3	2025-05-20 14:04:24.161
477	anonymous-a20c21f4	212f709a-8614-4fe3-9185-7f0af519cb48	2025-05-20 18:56:48.2
478	anonymous-854551e5	e93de6ac-4e8c-4dc0-863d-4495bb4ffe04	2025-05-20 19:38:47.482
479	anonymous-9b103e3a	83ce9e18-3ed6-4351-9f21-b7df3d1df9f5	2025-05-20 19:44:37.554
480	anonymous-ba51cca3	4460a08b-68ea-4409-9b86-b32dad9f79bb	2025-05-20 19:55:52.847
481	anonymous-daa696b0	8da50059-34bc-4d7d-937e-566a8906b46f	2025-05-20 20:34:39.818
482	anonymous-40c6d1c8	15f60f6a-d6f5-4c3b-b447-479c3bb01bc2	2025-05-20 21:18:05.484
483	anonymous-9860a8e5	54722bed-263b-4638-aa04-cfdeafabe3f1	2025-05-20 22:01:27.248
484	anonymous-ef84d815	fd9509cd-7d22-46c4-a580-d9910b285efb	2025-05-20 22:16:58.656
485	anonymous-8ea9190d	c6324003-669c-4f1c-9455-8ee1092d4795	2025-05-20 22:38:55.071
486	anonymous-6c609e97	ee54c8fd-3973-4075-8f78-93da5e820ade	2025-05-20 22:50:15.722
487	anonymous-ca1b6c25	6ca454d8-9755-4a43-b6de-a4dd95ab7149	2025-05-20 23:18:35.36
488	anonymous-9d8365f7	dc37cf33-a69a-4e42-a922-d9738ae1fef2	2025-05-20 23:56:52.316
489	anonymous-125871d3	da23b2aa-8802-4705-8cf8-7903f23d8c3a	2025-05-21 00:23:55.242
490	anonymous-ea7f6164	910bcb25-bbf7-41ea-93a7-5336778900b9	2025-05-21 00:23:57.782
491	anonymous-48d6aadc	ba70789b-3ec8-4d9b-bbea-364a8fbe5f17	2025-05-21 00:23:57.785
492	anonymous-e631e8d1	a7e93b4b-9d8d-48d6-b2c8-84d40fc46972	2025-05-21 00:23:58.967
493	anonymous-8f18be10	976a63f1-fb6d-44b3-a202-9b37b4a53b5a	2025-05-21 00:23:59.349
494	anonymous-2923e77b	3d28cd57-bbb6-41fd-91f5-5524cbd1c44b	2025-05-21 01:12:44.128
495	anonymous-71645490	c6fa0a2a-d1ef-45d7-903b-c097fcee8134	2025-05-21 02:27:58.783
496	anonymous-13e2c635	16dd32c0-cd99-47be-a757-8b4287c79300	2025-05-21 02:50:32.543
497	anonymous-88cbbd05	6c86414b-c719-4971-ab46-4787019467df	2025-05-21 04:16:06.229
498	anonymous-d039d1ba	658c9b02-aab1-4a72-9cb5-3ed560e23bf1	2025-05-21 04:16:06.76
499	anonymous-1c2823d7	4eb057ce-13df-4f66-9458-c3de3081b069	2025-05-21 04:16:07.093
500	anonymous-3b608b63	3c1dd199-39b3-4563-89ef-989fd9b6c707	2025-05-21 04:16:07.101
501	anonymous-71552479	c931d638-f0d7-4326-aa89-2690d714edaa	2025-05-21 04:16:08.143
502	anonymous-06d3366e	8580ba64-1a5f-4043-aa50-7031706e9145	2025-05-21 04:16:08.368
503	anonymous-f76e6e02	26bf041a-217c-4898-8e1b-a030c1120117	2025-05-21 05:17:24.494
504	anonymous-64e1272d	4ba78f32-f730-4b65-be82-042caadf6726	2025-05-21 05:50:08.963
505	anonymous-59245834	3955995b-946d-4a47-b46a-8b771ce14e28	2025-05-21 06:42:30.513
506	anonymous-d9a0b627	54e371ca-eeb2-4f21-b354-83dd2ce87663	2025-05-21 06:58:47.533
507	anonymous-956b2b48	b872c48c-d08d-43d1-9bb8-bf8b27e1eaec	2025-05-21 07:47:55.002
508	anonymous-9dbae2fd	68f6af15-975f-456f-9f4d-06cd9e1ef5ff	2025-05-21 08:32:42.019
509	anonymous-926101c0	7fe5bb5e-ec80-46a0-9a0b-fb1cfa84441d	2025-05-21 10:22:39.463
510	anonymous-8be9088f	61a1715c-43cf-4415-b059-a033f7ec89a9	2025-05-21 10:42:56.621
511	anonymous-53a8b4b7	abc8af4f-f6b5-4079-98ee-5e38dd9f1e06	2025-05-21 12:34:14.939
512	anonymous-58fa2dac	6892a082-b119-48ee-b633-a5019edf5567	2025-05-21 13:01:59.832
513	anonymous-c1bd8800	2133821c-463e-4346-bf44-499c65d1799c	2025-05-21 13:14:40.501
514	anonymous-18e17fd8	66c95585-e0fd-473c-884d-cb0abb902931	2025-05-21 13:15:00.869
515	anonymous-9d1bdf55	9a61c79c-f540-4df7-aec4-2282d465706f	2025-05-21 14:42:28.91
516	anonymous-8308ca9b	b869dfcd-9ab5-4d3d-94c0-464bef0cf7ff	2025-05-21 15:35:18.517
517	anonymous-cc44535e	134b58dc-e549-46b7-bea4-ca556fb9edd5	2025-05-21 16:13:00.983
518	anonymous-0c74b09f	4725e418-deed-4a3f-ae58-a4188a5173b7	2025-05-21 16:58:10.747
519	anonymous-5b53e578	47c55d9d-4a35-426a-b7da-076a38c95e5b	2025-05-21 17:13:05.019
520	anonymous-dd28a34b	0b6843d9-036f-4214-87c1-cac997c3ea54	2025-05-21 17:53:11.349
521	anonymous-2a27ed50	f096f63e-317e-4dd9-be00-d82184e020d2	2025-05-21 18:01:07.69
522	anonymous-d58584dc	f282cd70-f864-41d4-ab37-4c5d0cc9c99a	2025-05-21 18:02:19.888
523	anonymous-bac2867f	950bc53c-bd65-478f-a640-e98ef1efd7b4	2025-05-21 18:05:19.478
524	anonymous-5ce4375a	c25e2455-3631-48f4-8090-fe3f867fec3d	2025-05-21 18:06:53.886
525	anonymous-af58d1dc	44fb131e-6f33-4615-96a7-0456f26e9f4c	2025-05-21 18:15:32.253
526	anonymous-2eb71e30	c5ac63fe-bd82-4b25-8228-79067beb9d17	2025-05-21 18:23:06.545
527	anonymous-1e63149a	c0c923a4-eb74-4733-8031-f0c7af65aeaf	2025-05-21 18:31:58.914
528	anonymous-ed903130	2188f4c2-78ba-4ace-9884-1c051517c2c9	2025-05-21 18:41:56.732
529	anonymous-94e7bab6	0bf16ef1-4d96-4048-a2a6-870ef1a59f21	2025-05-21 19:01:14.315
530	anonymous-29a2aadc	03361d65-5aa0-442b-b0e4-74109857b409	2025-05-21 19:21:08.877
531	anonymous-817fb24a	55a8838a-0427-4375-9559-bbed2cd22baa	2025-05-21 20:13:15.37
532	anonymous-6626663a	ec172d9f-971c-41d2-a331-bd52fbe6a588	2025-05-21 20:24:39.516
533	anonymous-7d59caa7	cf082438-4667-4703-a458-890f7ba8fd2a	2025-05-21 20:58:16.012
534	anonymous-bd359fe3	58d7de69-0e1e-40fe-a171-d93b6a83f004	2025-05-21 21:03:08.087
535	anonymous-dabe56c6	c5649d6b-347f-4764-a07a-1598c8639434	2025-05-21 21:03:46.627
536	anonymous-ecd5bbfb	0499a07f-c5e4-40c9-a739-c37cf7848423	2025-05-21 21:06:35.743
537	anonymous-76687f05	cd6d5cbc-c5d8-4368-9d8a-749f1bdafa33	2025-05-21 21:53:02.171
538	anonymous-edba3fed	cac00926-6b35-4795-9e40-53f47a91810c	2025-05-21 22:59:01.703
539	anonymous-d9db80cb	abe955a5-dcb8-4f8e-a0b5-257b42467a37	2025-05-21 23:15:29.055
540	anonymous-78682426	05b36b03-4b2f-4738-95be-1112231d4f6f	2025-05-21 23:30:34.078
541	anonymous-9849970a	6eb46b0f-c135-4aaa-bf9b-1484186bde2e	2025-05-21 23:31:02.115
542	anonymous-93649de6	533fea16-c7bb-4bc7-93e5-955e596b1689	2025-05-21 23:43:01.611
543	anonymous-62bec676	0d362237-60ab-4b26-b262-5b6744fea943	2025-05-21 23:56:00.673
544	anonymous-4d4ab94b	7ee8d4c3-6024-4c0e-a3f6-4332a1a18ea8	2025-05-22 01:34:19.224
545	anonymous-d4f70b48	912db3d8-67be-4c51-9206-27f8ae7e7181	2025-05-22 01:41:49.558
546	anonymous-595b8c34	187ee480-9fd1-44e7-8ce1-995fb165c593	2025-05-22 01:41:51.455
547	anonymous-9117daff	6568694d-0499-4481-bf80-84b0de0baef6	2025-05-22 02:24:45.435
548	anonymous-999d40d3	d115407d-57b4-47b1-9757-86c9b6dd67d7	2025-05-22 02:38:35.713
549	anonymous-aca90395	33074b22-826b-430b-bd59-bf858adf6dd3	2025-05-22 03:45:03.908
550	anonymous-a4b3dd61	4bbf7615-d190-476a-b2a1-8b92512ed04e	2025-05-22 04:00:33.249
551	anonymous-35579e5d	b4dc8d2e-17c4-4341-935a-99755ef61e81	2025-05-22 04:00:40.42
552	anonymous-c5ed03cd	a98d4a32-6a9f-4312-936d-8d3bc1fe0bba	2025-05-22 04:00:40.913
553	anonymous-41fd548e	ab0422ae-9c12-4646-97a8-658955d5f757	2025-05-22 04:00:41.171
554	anonymous-62ce0fde	56041148-6b1a-4bff-abf6-d4597b8ca171	2025-05-22 04:00:41.418
555	anonymous-c55a9499	ac1bbb01-50ab-40ea-9e30-9217b180945f	2025-05-22 04:00:41.717
556	anonymous-0b590ead	5022e632-37e7-436f-bc2c-0011db21cfec	2025-05-22 04:00:41.996
557	anonymous-20872408	e46f007f-cfba-4a0e-933f-1b18219ded42	2025-05-22 04:00:42.284
558	anonymous-63dcef54	3c9b1886-2ad9-4d16-9c0d-870bc7ec1386	2025-05-22 04:00:42.525
559	anonymous-bac76bb6	70870a33-44b2-40a7-905c-713a3113ee19	2025-05-22 04:00:42.806
560	anonymous-5bfdbdfe	4622b556-78fc-494a-94b4-8f510d1e2210	2025-05-22 04:00:43.051
561	anonymous-278f7ce4	32c0162c-6013-460c-8103-8b2530814ddc	2025-05-22 04:00:43.29
562	anonymous-be89942c	72202dd4-5b5c-459f-ac77-e251c642f958	2025-05-22 04:00:43.606
563	anonymous-bab93615	09e7efe4-72bb-4077-93cc-d69aaad66a55	2025-05-22 04:00:43.837
564	anonymous-391ac549	983fc7cf-8309-4738-b7f8-a4f7c77d07d6	2025-05-22 04:00:44.073
565	anonymous-53ba0c28	525cb182-bbae-41d6-ae49-966635d59928	2025-05-22 04:00:44.315
566	anonymous-5b30f56d	94683e8d-c046-46c4-8194-8c4920bea233	2025-05-22 04:00:44.549
567	anonymous-1ea862fd	a6faddc8-e532-4dcc-84bb-cb8b561f1175	2025-05-22 04:00:44.813
568	anonymous-034d526c	5f718715-1fc2-41c4-a7f1-f6f4d25a6fcc	2025-05-22 04:00:45.068
569	anonymous-2b0462e1	dc6b0c29-45fc-4824-9899-c7cc3f80e59d	2025-05-22 04:00:45.326
570	anonymous-c50d9f71	684a3c8c-ad33-4054-b09a-2a715a7c4809	2025-05-22 04:00:45.561
571	anonymous-c71624a6	961e9452-2d78-4d0b-9fb1-bad1febe5c98	2025-05-22 04:00:45.805
572	anonymous-15df4509	60952ae1-2265-4adc-b768-27174f224f9d	2025-05-22 04:00:46.04
573	anonymous-61cda256	6757f9db-73f4-487a-994e-204201b42995	2025-05-22 04:00:50.976
574	anonymous-f5fbbca8	a6dbcac3-9af7-4dcb-9f27-4d37a4026b4a	2025-05-22 04:00:57.598
575	anonymous-41377f4a	27c4ebe7-7131-4d55-a691-8fdecde774ff	2025-05-22 04:01:09.89
576	anonymous-2307618e	6121f24f-131c-43a7-9b92-9fab0d1b7245	2025-05-22 04:01:16.059
577	anonymous-7f983419	d6c0be1a-b8dd-42af-9162-a5930c72d74d	2025-05-22 04:06:03.47
578	anonymous-0a8cf5f8	a46be39d-79e3-4ed1-b435-e9aa2a426599	2025-05-22 04:11:05.019
579	anonymous-0da94a59	ec154b1e-05f4-4c3a-85c5-497422813133	2025-05-22 04:11:05.523
580	anonymous-54d8bb5c	cb1c4ab1-d88e-41f8-869e-112825ab9b35	2025-05-22 04:11:05.531
581	anonymous-b822d4d8	0885ec3a-c830-4288-9626-b7f533b2be1c	2025-05-22 04:11:05.542
582	anonymous-683e75ad	a053aa95-d9c5-4af3-90dd-030ab182bbfd	2025-05-22 04:11:24.702
583	anonymous-826d5b51	8c98982f-c3a7-4ee5-a36f-6070c95de935	2025-05-22 04:11:25.063
584	anonymous-40acddd1	c15bf7de-75b1-4a11-aa8f-b2cee736f423	2025-05-22 04:11:25.08
585	anonymous-95070f80	b552e8a9-c16d-42e6-ad7e-79cd74b83ddd	2025-05-22 04:11:25.092
586	anonymous-446fd3fe	409fabdf-4a82-49cb-8a51-1719cee0eda7	2025-05-22 04:11:56.472
587	anonymous-f0249d5e	c0e83491-891a-45ae-b9f3-1f3158268218	2025-05-22 04:11:56.839
588	anonymous-cbcd3a23	f7910ff0-baa4-4717-b0d8-c15eab667471	2025-05-22 04:11:56.845
589	anonymous-4e07901e	4f216e2e-86c6-451b-ae4c-a41b673bd073	2025-05-22 04:11:56.848
590	anonymous-e1086a33	581f928b-739f-43b4-b523-05c39bfb2e7d	2025-05-22 04:12:09.362
591	anonymous-e5316f43	06aa9577-8cba-4b91-acb9-0f38784dc83c	2025-05-22 04:12:09.767
592	anonymous-54f46893	107da245-9ab6-4432-9d45-7de95fbb710a	2025-05-22 04:12:09.768
593	anonymous-80b349e9	4f2fad48-42a9-4fcf-83a6-706e374c5c42	2025-05-22 04:12:09.785
594	anonymous-7631efbc	9da73962-6e8f-4a9c-9cc7-3d18d40c6ba4	2025-05-22 04:14:02.171
595	anonymous-c1acd829	b721b676-1c74-4904-b0d3-f2be429b940c	2025-05-22 04:17:17.881
596	anonymous-e4a733f5	276e25f3-b72c-4e84-8dd4-3a521e27fcae	2025-05-22 04:23:12.204
597	anonymous-aeebe64c	33594c65-f739-46a0-8f85-b49270259439	2025-05-22 04:24:01.192
598	anonymous-646120c4	0c775522-0056-4657-967a-0a2684c20e94	2025-05-22 04:28:38.233
599	anonymous-f6bfc2e8	ce7dee16-8855-432d-b59a-6e25e7450d29	2025-05-22 04:38:16.954
600	anonymous-da57bb61	5703ec81-eec3-43b8-9436-bb1111172d81	2025-05-22 04:40:20.351
601	anonymous-7e94815d	8e183e5e-cc7a-4954-8ecb-7d05d57e1e93	2025-05-22 04:41:57.585
602	anonymous-9e65c712	c51ed773-8821-4f31-9081-072266e2786f	2025-05-22 04:41:58.073
603	anonymous-3a24da9b	aea9727d-81e3-4ca8-bd05-4369a4d39270	2025-05-22 04:41:58.543
604	anonymous-f97ac876	7d94a2c4-f128-468e-8a8e-f91e5f122498	2025-05-22 04:41:58.819
605	anonymous-1eb4e3f5	582cbb62-6af1-43c3-b491-e00b6178f532	2025-05-22 04:41:59.088
606	anonymous-202a128d	b2d2864e-a484-40fc-bc38-618c52653d8c	2025-05-22 05:03:14.258
607	anonymous-e1acecbf	8e1a0ab8-0760-4f5c-93ab-6f4a508f9066	2025-05-22 05:05:09.634
608	anonymous-b43bc18d	78cbba4b-5978-434e-8bf8-9f450fc3d9f9	2025-05-22 05:06:45.37
609	anonymous-73c016a5	972f5473-79f1-487f-9c11-785a14f73fe1	2025-05-22 05:08:49.206
610	anonymous-c0003e25	f0a3bef0-9009-485c-afbc-77e99beb9790	2025-05-22 05:12:13.37
611	anonymous-7ad86ff5	370eff2f-da83-4219-8d77-306de7132054	2025-05-22 05:16:04.273
612	anonymous-81d7ce74	2b2f01d4-178a-4c4b-8e19-06d7b26dc84f	2025-05-22 05:21:59.064
613	anonymous-c8f64d92	8c64196f-bff8-4368-aa95-caf04473b398	2025-05-22 05:25:11.279
614	anonymous-cc402283	6a5cd80c-1b36-4a99-a03e-b6d75f65ceaf	2025-05-22 05:28:32.528
615	anonymous-9b33369d	d083f438-c4e6-4565-b3e6-9a60bc3365c3	2025-05-22 05:45:28.077
616	anonymous-7c7d3536	a05f0c86-641d-41ce-ad7f-14db34260fc5	2025-05-22 05:55:58.876
617	anonymous-a214ab91	0d604da9-d0d0-4bf2-8d6e-59063abeccd1	2025-05-22 06:02:21.147
618	anonymous-9cc7102d	38918e0d-aaa0-4d81-abfe-b8716f552336	2025-05-22 06:04:32.414
619	anonymous-c67e403f	ac8e16eb-4587-44fa-903e-905ad4c37922	2025-05-22 06:16:52.48
620	anonymous-970e41f7	84a87217-443a-4517-90af-3ff294d25efd	2025-05-22 06:22:54.06
621	anonymous-4319d3d2	0b9022b8-968f-4a8d-824e-6c5ad0c9662f	2025-05-22 06:22:56.934
622	anonymous-f28abcaa	0fc8ba08-640c-466a-a066-28b91944be56	2025-05-22 06:22:56.938
623	anonymous-fd26b4f2	e676f26c-10dc-4ffd-93fe-30d8118b9ec1	2025-05-22 06:22:56.941
624	anonymous-66c5149e	ae448aba-2231-4c33-bc3f-1a0b52d077ce	2025-05-22 06:23:31.124
625	anonymous-6aac949f	2ee06e7f-3d3c-46d7-9e10-96eed5559d26	2025-05-22 06:23:31.541
626	anonymous-f4741586	7af44d9b-87f2-4f8d-9ee3-6f810aeca1e1	2025-05-22 06:23:31.542
627	anonymous-553f8438	8a192fc3-430b-421a-b1fd-eb6c039b566c	2025-05-22 06:23:31.551
628	anonymous-75d05251	f985b66d-6c22-454b-9ca1-49a2deccb79f	2025-05-22 06:32:24.527
629	anonymous-9acf43c4	01b6e0f0-4d94-489c-9f32-9c034931d04b	2025-05-22 06:32:25.464
631	anonymous-5dd744ba	44008fa0-f9fb-4c47-8f43-201581ba446a	2025-05-22 06:32:25.5
630	anonymous-ecc7177e	a83314b5-e430-4808-af48-f7bea33480bf	2025-05-22 06:32:25.497
632	anonymous-d1d33e87	7c3e6079-3f37-497f-b8e1-10486b7bcd78	2025-05-22 06:35:06.488
633	anonymous-46476b63	782ada8b-48c8-4f9d-a90a-37c51693e544	2025-05-22 06:35:09.328
634	anonymous-8308b919	e4df3275-0e63-4b6c-b646-c5869ed02703	2025-05-22 06:35:09.331
635	anonymous-f0cf806f	f58db7e7-a9f8-4382-9cca-5c68e7e940ab	2025-05-22 06:35:09.334
636	anonymous-7b98ec74	1724105c-c168-4e78-b6c2-9cb470b1770e	2025-05-22 06:43:40.833
637	anonymous-881dad61	73e688f7-a847-4322-8ab2-103273c9b8c7	2025-05-22 07:03:33.885
638	anonymous-b976676c	4520f22a-89f5-45cd-b1f5-8df124804e81	2025-05-22 08:46:12.593
639	anonymous-6daf6b80	a387ba9c-0666-4a7e-8999-2bc727e4fda8	2025-05-22 08:46:15.87
640	anonymous-f7dcfee8	0f77116d-36cb-4bb1-bb03-169e67b585ae	2025-05-22 10:10:06.685
641	anonymous-9274879a	52228c80-132a-486e-82bb-ac598c37a300	2025-05-22 10:10:07.82
642	anonymous-9ff6ec9f	d656d884-df75-438d-a19d-8207855bfce9	2025-05-22 10:10:14.284
643	anonymous-414f22d9	f8da07d7-16f0-4ee4-b9e8-260e248c965e	2025-05-22 10:10:14.765
644	anonymous-9ca386a1	a13bb60c-f78a-4352-8c5b-33e5269e9daa	2025-05-22 10:10:15.222
645	anonymous-f4849d6b	349acf01-334d-4b18-aaa0-741f0f9507ef	2025-05-22 10:10:15.649
646	anonymous-d4e97e79	d58b474d-4a43-4595-a270-b20b142b5433	2025-05-22 10:10:16.056
647	anonymous-5230c434	fcda1037-1e47-48ea-baad-dbc46c428247	2025-05-22 10:10:16.492
648	anonymous-9b881df6	8d926e9d-499d-4e9b-9323-422da787ea85	2025-05-22 10:10:16.921
649	anonymous-f6481486	31b26fe9-2f01-4f2d-be91-b78df8cbe813	2025-05-22 10:10:17.362
650	anonymous-0adbf385	21592771-ca2c-4fba-b382-5f9f5d8c6a8d	2025-05-22 10:10:17.801
651	anonymous-8dbae653	97351c72-6079-4269-831b-ac87cd7025eb	2025-05-22 10:10:18.225
652	anonymous-03bde7da	d95391b7-d223-4995-aff8-f7b586069613	2025-05-22 10:10:18.64
653	anonymous-a75a544c	58af47ed-16f8-4b14-8daa-f86774d91d13	2025-05-22 10:10:19.074
654	anonymous-003d1bfa	3688db35-7ab1-4d7f-a2ba-575acdeb123c	2025-05-22 10:10:19.513
655	anonymous-5bf6563c	0a786f5b-417b-4231-960e-235d98b17e80	2025-05-22 10:10:19.947
656	anonymous-e7224f2d	a88c88b4-6f62-43dc-bf5b-64fbda94a569	2025-05-22 10:10:20.376
657	anonymous-8f62fbc8	877e7f4f-5939-469e-a453-0d52feda8786	2025-05-22 10:10:20.823
658	anonymous-77587dfc	a293a81a-b61f-45de-ac1c-92de8687925e	2025-05-22 10:10:21.278
659	anonymous-af40cfab	6e21bd09-93c4-432a-9efd-6fe5391e26ea	2025-05-22 10:10:21.685
660	anonymous-1ac3996f	6e16a2d4-9292-4076-89ee-4b374ade0887	2025-05-22 10:10:22.126
661	anonymous-4eb2f463	2c2a8244-62a0-4090-9832-24d54303d4ac	2025-05-22 10:10:22.56
662	anonymous-104d2d1e	25e19e67-f57c-4233-a40a-1138591b1152	2025-05-22 10:10:22.979
663	anonymous-e1b7e65d	d9759713-b0db-4ab6-bb9c-561b7e8f3636	2025-05-22 10:10:23.42
664	anonymous-559b0c65	950705e7-aac8-4fe3-8b02-86b153021c27	2025-05-22 10:10:23.842
665	anonymous-5969f7e6	8e689af5-770a-46ef-a820-358f39b5c5b5	2025-05-22 10:10:24.264
666	anonymous-a8409655	5ec30338-9265-4ee9-b009-706ea1761036	2025-05-22 10:10:24.674
667	anonymous-33ec8b00	7d780f8f-4a45-491a-8085-b05164026751	2025-05-22 10:10:25.084
668	anonymous-e589c6c8	273d8af4-62c0-45ea-9a68-49be29dd9ffb	2025-05-22 10:10:25.522
669	anonymous-d61e48ab	0fc69a98-2293-4c59-a49d-1402b7b5e892	2025-05-22 10:10:25.976
670	anonymous-6f24a390	af40b3dd-e040-4b95-b123-f5f8c244677a	2025-05-22 10:10:26.41
671	anonymous-506ad839	9cc23b92-f0fd-422a-a3bf-fed8cc68be54	2025-05-22 10:10:26.851
672	anonymous-439ce831	4f1ef83a-2b46-4d59-8662-407d492dbac4	2025-05-22 10:10:27.299
673	anonymous-8ce1910a	17ae6914-2bf6-44cd-a65e-af215bd8a94a	2025-05-22 10:10:27.726
674	anonymous-68cc3899	8f32b752-568f-4e9f-b980-e16517169c3c	2025-05-22 10:10:28.166
675	anonymous-8c458a34	0d00f782-8e02-4a83-ba49-197872e0990e	2025-05-22 10:10:28.598
676	anonymous-90bb4691	95dd5825-2422-4642-b84a-fefc648c75cb	2025-05-22 11:29:33.256
677	anonymous-6a93165c	a558b509-05e8-4b3d-aaea-910ed5115436	2025-05-22 11:29:37.549
678	anonymous-d660e41a	91c72725-d335-4797-ac0a-13f08e2acb52	2025-05-22 12:26:14.857
679	anonymous-de0057fd	b200a2bd-24be-4d9e-9b3f-1a7e0ac7b001	2025-05-22 12:26:17.605
680	anonymous-259ea5d7	ef1891b7-0f64-4853-bbf7-7e6289d47100	2025-05-22 12:26:19.737
681	anonymous-c9d67cba	d0bd1d90-4ba6-4bd4-a3cf-6bffd85d9e97	2025-05-22 13:14:39.016
682	anonymous-89bff7bb	2ef909e1-c867-4a8a-a559-a50f1c80b326	2025-05-22 13:14:40.207
683	anonymous-cd50408d	d19fe7e1-d202-407a-b6df-2716c3047597	2025-05-22 13:14:40.237
684	anonymous-575e3e0d	b141be6f-092c-40f2-b267-3557ea4c76fb	2025-05-22 13:14:41.555
685	anonymous-b7abde81	36bf9304-fcd9-44d3-ba13-e768f23e47bc	2025-05-22 13:14:41.765
686	anonymous-e56905b7	148c0915-cb36-4e39-af1e-841d74eebdde	2025-05-22 13:40:48.585
687	anonymous-f30e434f	4494e140-b610-432e-b8c3-40de609fd67e	2025-05-22 13:41:29.009
688	anonymous-17633a45	5f7ddf08-76b7-40c5-8092-7e58e140d9c2	2025-05-22 13:42:45.786
689	anonymous-54d8fb86	7632c30c-cb82-46dc-8c7d-d1a5576e6083	2025-05-22 14:00:01.838
690	anonymous-587ca5cd	ff69c414-3773-4529-a90c-3ecd3b3f2ba6	2025-05-22 14:18:47.49
691	anonymous-18b1a92d	25264476-ec26-48a2-a10f-971d850a2093	2025-05-22 14:18:47.493
692	anonymous-94f39863	0f5dc9be-35e8-4d47-a1f7-d2aca798e907	2025-05-22 14:18:47.973
693	anonymous-f1e9f996	97448a5d-7996-4f76-ab4a-9c4bf5412afc	2025-05-22 14:18:49.433
694	anonymous-1e2561a5	144088b0-573c-4449-b7ff-53cc1199f4e0	2025-05-22 14:18:49.437
695	anonymous-9a42bcea	ffdcef3d-d121-4ac7-8cd5-f7971a898523	2025-05-22 14:18:49.835
696	anonymous-cfca20ba	ec295764-43ee-4ea7-b97a-a2f9ea59922c	2025-05-22 14:18:51.073
697	anonymous-726e37aa	8f2cf9c3-9a5b-44df-94c4-7d2a5493bb3a	2025-05-22 14:18:51.123
698	anonymous-852aeecc	cc841076-1c67-4545-ac9f-34912044d95a	2025-05-22 14:18:51.551
699	anonymous-e21506a7	433982d3-8ed6-416c-95a1-439ffd6b0cf4	2025-05-22 14:18:51.556
700	anonymous-42cdde7a	befaa603-8622-424d-9dc9-d82d387d610e	2025-05-22 14:18:51.556
701	anonymous-6dc9c06a	89191043-5cd7-4e9d-ad17-36f86b73691d	2025-05-22 14:18:52.447
702	anonymous-c0f268f9	899df3c8-2e8a-4675-8c1a-6210804d7163	2025-05-22 14:18:52.557
703	anonymous-2de783b7	73d9467a-9710-4838-a082-30ef6ffb06c9	2025-05-22 14:18:52.558
704	anonymous-aa748d86	f8ec6ddc-3ade-42a6-9d08-42d51564ad2d	2025-05-22 14:18:52.67
705	anonymous-0c57c57c	bdec6c4f-acbc-48d1-a7a1-65bec1b10507	2025-05-22 14:18:52.746
706	anonymous-5771ae65	d38522d1-87dc-41f6-a48c-35ac5667b6b8	2025-05-22 14:18:52.771
707	anonymous-bd14986a	1895d254-cdf0-45d2-ada0-5b037840bdc8	2025-05-22 14:18:52.81
708	anonymous-6838ba4b	1dadca45-9e35-4479-9aab-1deea770cbe0	2025-05-22 14:18:52.83
709	anonymous-a303d5cc	b2549f9b-c092-40b6-ac60-f86aa5e86346	2025-05-22 14:18:52.845
710	anonymous-056666e4	e6bbe120-3c37-4934-83ce-a15ce2f30fda	2025-05-22 14:18:52.9
711	anonymous-51476ff8	0631d955-9efe-45fc-a265-be1a62c23ec2	2025-05-22 14:18:52.923
712	anonymous-4398a17b	f9d4c0b8-c8ff-4f6b-9815-cecdfc6df5a6	2025-05-22 14:18:52.988
713	anonymous-5a9bcec1	80cff445-09f0-4e11-92fc-e3d6f027af41	2025-05-22 14:18:53.005
714	anonymous-0a4d3bc2	aed71930-e32b-40db-99f2-054357bdbdaf	2025-05-22 14:18:53.065
721	anonymous-15190e55	58200798-6c01-43b1-a5a6-c314254741b5	2025-05-22 14:18:53.661
722	anonymous-248f9dd0	5bf0af39-ecf1-4d51-a3b0-8ee6c310ed47	2025-05-22 14:18:53.884
723	anonymous-57727242	466b5961-d0b9-42df-b886-03e582c2cbb2	2025-05-22 14:18:53.969
724	anonymous-c60bce2c	669f37ba-8036-4d9f-830d-d5b7f92f688b	2025-05-22 14:18:54.385
728	anonymous-41d60932	523beef7-9187-484b-92b1-bbcb54f2301a	2025-05-22 14:18:54.656
730	anonymous-f3f8e7fc	5fbb1b1b-2f49-45c2-afe1-1898b2524e7a	2025-05-22 14:18:54.798
733	anonymous-ec9703e5	80529245-5f76-4731-ae05-c513834d7509	2025-05-22 14:18:54.831
737	anonymous-1df2fee4	a780f729-a11d-4345-a1c4-c462681520bd	2025-05-22 14:18:54.953
740	anonymous-96a817bd	038346ca-bc34-4961-a535-6af8d3804b07	2025-05-22 14:18:55.192
746	anonymous-45074e58	6e8780e7-39df-44a5-b1e0-45413172eb14	2025-05-22 14:18:55.709
753	anonymous-f25cbd68	64d0d83a-e795-48e4-822a-5f0318ecead9	2025-05-22 14:18:56.033
754	anonymous-5e5d1eb2	ffc7561b-8ba4-4208-b8bf-d81424c49b0a	2025-05-22 14:18:56.138
760	anonymous-91f47414	363f7c81-333d-4735-a8a6-bddb9a735aaa	2025-05-22 14:18:57.37
762	anonymous-3190a499	4bd736b8-1918-4682-b5d3-2a07ed62af03	2025-05-22 14:18:57.48
769	anonymous-e07d60cd	13df9b43-a30b-4238-9d6a-6282177d479d	2025-05-22 14:18:57.711
770	anonymous-77d75815	a14c5a61-4c37-4cd0-a335-4c41ba619943	2025-05-22 14:18:57.809
779	anonymous-121ff0f9	baea8c6d-3672-46b2-8859-116cf4994ce6	2025-05-22 14:18:57.934
781	anonymous-447f12e8	f52f294f-c447-47a2-9cbd-fd557ca2459a	2025-05-22 14:18:57.95
782	anonymous-7e3f0e8e	7213e75c-b239-446c-b1c4-4f4d9ceafa21	2025-05-22 14:18:58.027
784	anonymous-2b57dbaa	eb5b0877-6513-4153-8579-fd6f62c34717	2025-05-22 14:18:58.033
715	anonymous-c3cf4510	beb2e26a-68e3-4856-8a11-6766371b1bae	2025-05-22 14:18:53.065
717	anonymous-95bb5b7f	a7b72a16-7fd4-4a9e-ad0e-42f3f55bf79b	2025-05-22 14:18:53.241
719	anonymous-37b47513	3465d577-b9cc-44ac-9143-0360401ee6b7	2025-05-22 14:18:53.404
725	anonymous-3508902e	3d513a99-fbed-4b11-9701-f8f36981d7cf	2025-05-22 14:18:54.59
726	anonymous-15764152	a702f014-5d99-4e73-835a-0b523544c3d0	2025-05-22 14:18:54.649
731	anonymous-d86f3015	22ae7ea9-b09a-4f24-a756-76fe9bc0bf50	2025-05-22 14:18:54.809
735	anonymous-bd45d2bc	383b2ed9-c754-4f93-b447-42c59a67e240	2025-05-22 14:18:54.949
738	anonymous-ec4ce1c3	fa5996ea-4d63-49c9-8b7d-c22bbe73158a	2025-05-22 14:18:55.122
741	anonymous-02d9b365	a435ced8-1b3f-482c-9e62-7e2434ab3608	2025-05-22 14:18:55.183
743	anonymous-e14cd5ae	6d7776e5-f9eb-495a-9387-3fa506cfc58b	2025-05-22 14:18:55.396
749	anonymous-ec3789fb	98c6bed4-7a6d-47a9-998c-34ef8580ca82	2025-05-22 14:18:55.88
750	anonymous-c99107a0	9ffbc61d-531d-40c4-8c51-b3c118887dcb	2025-05-22 14:18:56.004
757	anonymous-ab8e6281	75118bb2-7d10-4beb-bc1e-05fa30f14f60	2025-05-22 14:18:57.178
759	anonymous-cb5b6414	5dadd484-9cd1-42a0-87fd-4bf3596c8fb2	2025-05-22 14:18:57.366
761	anonymous-db34f70d	42475f68-bbcf-4227-8d80-3c4b6b9ac2eb	2025-05-22 14:18:57.477
767	anonymous-043853d0	7f8ee486-697e-4e73-b3d2-6bc29704d500	2025-05-22 14:18:57.705
773	anonymous-798fffa8	5cbba59e-7c01-4c78-9bb5-e81cb388259e	2025-05-22 14:18:57.814
778	anonymous-ef72c954	5a7ce07b-07a7-431c-a7ae-f06ab4e0686a	2025-05-22 14:18:57.924
785	anonymous-3777164d	fac6d167-6383-4346-b1e5-4103bd96a80f	2025-05-22 14:18:58.045
716	anonymous-d407ec24	0eff5808-a642-4369-92e8-01e6f6b0807a	2025-05-22 14:18:53.13
718	anonymous-88a7844c	7af15de3-8940-442a-b508-5435560e4bd8	2025-05-22 14:18:53.404
720	anonymous-6731adf5	fda1a92a-c728-4e55-9381-8e34d737cdcf	2025-05-22 14:18:53.496
727	anonymous-7ae9aaa1	91bd72d0-1310-4786-b372-97eb39c30fae	2025-05-22 14:18:54.655
732	anonymous-e92b4738	6758246a-5eba-46ca-9a78-4dd4a3209112	2025-05-22 14:18:54.812
734	anonymous-608ec2fc	d5b517e8-5310-478d-9f25-d9cb81d8799b	2025-05-22 14:18:54.924
752	anonymous-fb62cf61	7c051be5-8d7d-473a-be4c-790086720056	2025-05-22 14:18:56.032
756	anonymous-4cb4f9bf	2c3294ed-d07e-4b8d-bc4d-35b139cd2fe9	2025-05-22 14:18:56.614
764	anonymous-eb3b0948	63ac9a0f-18ca-4413-b10b-46bbaf145952	2025-05-22 14:18:57.493
766	anonymous-20e229ad	1456fc10-1b50-4e91-bcf5-d53e9c20016f	2025-05-22 14:18:57.702
786	anonymous-4532c5cf	58056193-38a7-495e-aed7-5650f8e2756c	2025-05-22 14:18:58.068
729	anonymous-fc8585c1	df446e37-56a1-4a2e-a10d-122b2aa5ef67	2025-05-22 14:18:54.655
736	anonymous-91e16243	c1ed9562-2360-4550-b460-86fc9955c934	2025-05-22 14:18:54.954
744	anonymous-e837102f	d977bd76-98e9-46a0-bdb2-503e889b6192	2025-05-22 14:18:55.408
745	anonymous-afc69584	d78af79d-386b-406a-aeea-c5fbfebf170f	2025-05-22 14:18:55.471
755	anonymous-1a754e93	3573293c-7d96-4a1b-b1e7-5e135ea162e6	2025-05-22 14:18:56.425
763	anonymous-19c70e80	3bc51324-c9c6-4822-9ab7-eb23feb1eb7a	2025-05-22 14:18:57.489
765	anonymous-f26860d0	ba5727b9-e467-4e65-b53b-912de39f10c3	2025-05-22 14:18:57.699
771	anonymous-71cb743e	7cadc533-cd07-4234-b095-4f1c26059bcd	2025-05-22 14:18:57.806
775	anonymous-fd052431	7d3fe79f-a686-4138-bfd5-5d4ac393aae6	2025-05-22 14:18:57.852
776	anonymous-08165d3d	fdf9e61d-5f50-4def-b123-e2a7e3880f08	2025-05-22 14:18:57.919
787	anonymous-1076a0e6	f86a77bc-f170-4ace-9e05-e8d7e2d89443	2025-05-22 14:18:58.068
739	anonymous-93ec8368	4abbc30f-f554-4c79-b14b-b715c37b7200	2025-05-22 14:18:55.184
742	anonymous-28b852b0	5e02485c-53d2-4101-814a-b0e630a35bd4	2025-05-22 14:18:55.321
747	anonymous-2ec1ed6b	c1a35979-5e80-44df-b400-7cf6150f7b63	2025-05-22 14:18:55.721
748	anonymous-71b19754	6ac3357c-4038-4298-b8d8-5102e1446b62	2025-05-22 14:18:55.845
751	anonymous-f96c09ed	2a11cd05-cefa-4188-b969-b31f225ea2b7	2025-05-22 14:18:56.015
758	anonymous-524f6469	03e9963d-9b24-4416-befc-d379aa22be1a	2025-05-22 14:18:57.252
768	anonymous-7be7abd2	2d0381f8-3188-47cb-a61b-def959eeb510	2025-05-22 14:18:57.709
772	anonymous-92974946	ca2b9af9-b26c-428b-bc48-06927c444e11	2025-05-22 14:18:57.811
774	anonymous-ade20fcd	f32069fb-cd44-4ef8-bdee-a1f174f6014f	2025-05-22 14:18:57.849
777	anonymous-24f19d49	e39de382-34a6-4a98-abfd-a2964132daeb	2025-05-22 14:18:57.922
780	anonymous-20a541cb	118da7d4-a772-467f-a801-d03e6b7db9fa	2025-05-22 14:18:57.952
783	anonymous-7917e435	5534c753-013a-48ba-a0bf-487164ca5658	2025-05-22 14:18:58.03
788	anonymous-42b376a2	7b9d9699-b73b-49b0-a4dc-02cf730708ed	2025-05-22 14:18:58.13
789	anonymous-05ee0602	00544fd0-1a9e-4947-8974-38b673f9eb19	2025-05-22 16:08:38.665
790	anonymous-3351ef00	8da3137f-f39b-459c-9eef-323bf6bc2b68	2025-05-22 17:01:53.195
791	anonymous-939827dc	6f9633af-50c6-47cb-b7a3-09714f0fb1fc	2025-05-22 18:11:13.856
792	anonymous-f6866477	106aad19-3f3e-4515-becc-da7cc704c08a	2025-05-22 19:04:28.233
793	anonymous-56b1368c	2a04288f-d04a-4104-895b-122380944395	2025-05-22 19:04:38.027
794	anonymous-e2133e44	347d9a2d-344a-4b82-a7db-d82838723e79	2025-05-22 19:06:11.636
795	anonymous-0998e75b	acbddcce-bda8-4cca-91c3-3144d3764bbf	2025-05-22 20:00:24.374
796	anonymous-cd91752e	713902bb-5e81-44bb-855e-69456a0aaac0	2025-05-22 22:41:52.023
797	anonymous-428acd36	8bb4fbe0-8b14-4f13-a598-b8070f0ecf6c	2025-05-23 01:52:20.221
798	anonymous-0ff90490	23c11e2c-d3bc-4616-bed3-3a3ee9ff024c	2025-05-23 02:00:14.33
799	anonymous-060912ba	d796d6c3-cf6a-401f-8e88-2a42e0c3c6a5	2025-05-23 03:38:50.789
800	anonymous-365b663d	e22eebfa-7d6a-4baf-b478-c383746c74b6	2025-05-23 03:52:48.772
801	anonymous-869e89f1	7e89efd6-65a8-44bc-ab9c-5845aae70b2e	2025-05-23 04:24:31.085
802	anonymous-3c262e5f	bda2ebf4-2524-47e5-9cfb-83f7290b0577	2025-05-23 04:25:28.074
803	anonymous-3da1e814	75e3b628-60a8-4606-acfd-e9c65b7aa32a	2025-05-23 04:29:23.371
804	anonymous-412ff5e9	ac7737cd-1ca9-4ab3-921f-dfa9310605bd	2025-05-23 04:39:16.491
805	anonymous-a61d1b83	0cbb43bf-15b7-486d-8fb8-9f63c137fc5f	2025-05-23 04:40:19.229
806	anonymous-b9b88f8b	32bfb1e7-f5ce-4851-a309-3d6a008c49ee	2025-05-23 04:48:06.065
807	anonymous-c0f46c2f	445f656b-13f6-492c-a388-f2406ed41d90	2025-05-23 04:50:49.952
808	anonymous-4059c57f	ed766d68-c69d-42e4-bfce-590e597b8dec	2025-05-23 04:50:51.201
809	anonymous-417320a4	f40343ed-7da8-40a0-9cc0-f773e406acea	2025-05-23 05:00:44.334
810	anonymous-541c240c	40e1b19f-0d23-4811-879f-74579a359311	2025-05-23 05:18:41.574
811	anonymous-3180a21a	a7b5c4e4-ad3c-4185-ad91-cd83fffcb0aa	2025-05-23 05:18:51.546
812	anonymous-a0b9923b	edecdf06-b3b3-40b9-848c-927dbb2baff8	2025-05-23 05:20:09.328
813	anonymous-34406b42	fa30934e-c8cc-4dd6-ad61-fe70f310e55c	2025-05-23 05:30:22.767
814	anonymous-f219e9e1	21a100c9-20aa-418a-95b8-d7698aaaa5f3	2025-05-23 06:07:04.466
815	anonymous-1520e20d	61fdc478-b176-4fe8-b806-136bdcf764ce	2025-05-23 06:12:58.905
816	anonymous-e86f11ee	171a645a-e4ed-40a7-a124-bd94c2d595c0	2025-05-23 06:38:20.254
817	anonymous-306aae70	4496ee33-8588-4a3b-9492-fc94c94d1aa4	2025-05-23 07:14:00.844
818	anonymous-c42eb284	7499f35a-6f67-4a23-a511-37cd2d285a18	2025-05-23 07:50:44.187
819	anonymous-5f1f9685	c1b532a1-9f79-4a52-be73-03ecd8346c01	2025-05-23 07:50:43.951
820	anonymous-846e0e05	7484b8cc-956d-4079-9b6d-bbda42fe5a1b	2025-05-23 07:50:44.071
821	anonymous-9bef2158	d07bc379-3e93-4889-b4b4-0cac79c5d0da	2025-05-23 07:50:46.043
822	anonymous-665de329	91a44273-49e5-4a0d-8c15-02d4cf816e76	2025-05-23 08:21:43.752
823	anonymous-99bad8e4	a268af3b-cbc9-40ea-baa4-898f6fd42e9c	2025-05-23 08:28:01.387
825	anonymous-4a832d4a	ba84b796-3bf5-4583-a314-59f21f5d54c5	2025-05-23 08:28:00.999
824	anonymous-11e28fdb	e193c5de-37ae-48a1-adef-e3d69ed486de	2025-05-23 08:28:01.046
826	anonymous-a91b83ef	d3dfee54-1b87-46b3-bf63-12197f689917	2025-05-23 08:28:01.067
827	anonymous-887b90f8	3dcc950f-ec73-4499-aa58-2dc7cb6ae746	2025-05-23 08:28:01.741
828	anonymous-9a1f01eb	519e2287-0660-4322-b9b7-27a77d24575e	2025-05-23 08:28:02.532
829	anonymous-3be6fc5c	fb85d83a-d78b-4bf6-a4de-58d00757c0ed	2025-05-23 11:16:17.916
830	anonymous-3f69eb27	575a010f-5768-40b5-bcd3-a01d93cd1a2d	2025-05-23 13:34:13.898
831	anonymous-e9f2f715	4631d43c-83de-45c3-b5ed-365c57fc911c	2025-05-23 13:34:13.908
832	anonymous-800d6b9c	7c6c06c2-10e5-478d-ae49-9e7f2cf7d72c	2025-05-23 13:44:56.927
833	anonymous-b2303ed1	90625f4b-36fa-4354-b7db-104341fc7f69	2025-05-23 13:57:32.306
834	anonymous-3bc82cde	209c28fe-b64a-4111-be9e-df8bbb69d118	2025-05-23 14:49:41.609
835	anonymous-843a9cc2	b3019278-2835-4eb3-9546-d7a7e42249fa	2025-05-23 14:51:59.976
836	anonymous-a339aa66	49eafec1-e2f8-40d4-afc2-63a7020c0390	2025-05-23 14:52:32.578
839	anonymous-8acc0be8	79fd1672-d977-46a7-b911-4bfd354a0540	2025-05-23 14:58:20.978
840	anonymous-4ebaf475	b1438331-de0d-4dcb-8ab1-edab18581d28	2025-05-23 14:58:20.979
845	anonymous-17a32af8	0e6eb3a1-9297-4b81-a83f-d651df326a0f	2025-05-23 14:58:20.98
843	anonymous-d0772775	c01dceb0-2ae9-48ef-89e1-e5081d233e01	2025-05-23 14:58:20.969
837	anonymous-c32457e6	6bbdb0d2-bd44-4593-ab77-1df9e5ce7cd5	2025-05-23 14:58:20.974
844	anonymous-c40dd955	f74823f3-a5b7-4c27-b0ed-00a855cfb752	2025-05-23 14:58:20.973
841	anonymous-fe2d6b98	1534af6b-e1ce-4bc6-9211-330e204a8b47	2025-05-23 14:58:20.976
842	anonymous-fe4f744b	1b7c25e2-35f0-4464-aa3f-e839fba84932	2025-05-23 14:58:20.971
838	anonymous-b6b2225c	337c251e-a75a-486c-af7c-14f7fe5d9ed1	2025-05-23 14:58:20.972
846	anonymous-702928f5	981141eb-e498-42a2-8625-c3be549232a9	2025-05-23 14:58:20.977
847	anonymous-f0f2b4b2	7d02ab47-a50b-4ab6-b25e-037cac5a86be	2025-05-23 14:58:20.981
848	anonymous-323281d0	792665d3-c1b1-4b8f-8456-6b7180a87e44	2025-05-23 14:58:20.982
849	anonymous-da8537bb	30bba59a-0a18-4753-9877-ca77b60e7b5d	2025-05-23 14:58:21.173
850	anonymous-8168f864	b9b3a809-933e-4f5d-85d4-ffbb50bf2ddb	2025-05-23 14:58:21.277
851	anonymous-97c56582	cc41a292-6c82-44b8-8928-5065c06c40f2	2025-05-23 14:58:21.332
852	anonymous-f2899a6c	9c09566d-8506-400f-bb3b-6bb9428240d1	2025-05-23 15:16:39.287
853	anonymous-6c9f5ad6	64ab3da6-82f5-47bd-b94c-f30b855f8601	2025-05-23 15:16:39.74
854	anonymous-6afaef90	ae95eda3-5ba5-43c3-8c7f-5714d41f93a3	2025-05-23 15:16:39.752
855	anonymous-d0b7fc53	93832cbe-48f0-4889-9645-326a83e67905	2025-05-23 15:16:40.91
856	anonymous-6e428c00	29fae871-7e95-4c8d-87e8-a3effae13734	2025-05-23 15:16:41.186
857	anonymous-34d7045d	1ab574d2-28a1-4bcd-b590-af2b4e9d5447	2025-05-23 15:16:57.971
858	anonymous-d910bde1	80447b28-937d-4082-b527-29222aaaffc5	2025-05-23 15:16:58.353
859	anonymous-19a5b602	e2affd44-a68a-43ca-8abf-3510663bd63c	2025-05-23 15:16:58.364
860	anonymous-04dc0584	355296dc-e209-422e-95e7-3feec5470001	2025-05-23 15:16:59.598
861	anonymous-293fc909	0f09377f-a8e1-49d6-ada0-b90a8a56765a	2025-05-23 15:16:59.819
862	anonymous-8c5206a2	b6fe4b36-a297-46eb-983e-13c5b4849b88	2025-05-23 15:22:41.118
863	anonymous-5a75ab6e	c4efffef-5bfb-4ab5-852d-8dfa460ab32f	2025-05-23 16:25:25.127
864	anonymous-4b754786	f89e4981-f5e5-4189-8979-195618440114	2025-05-23 16:31:59.724
865	anonymous-63aabf78	be4b781e-bff2-4ea1-babe-c9824675ee96	2025-05-23 16:33:06.456
866	anonymous-85e447ff	5f0406e9-f629-47ba-9b25-34aa137e7be6	2025-05-23 16:33:21.91
867	anonymous-912ce169	f1298a00-9cfd-4d8f-8ff1-d47393157451	2025-05-23 16:33:28.845
868	anonymous-754d3f20	1eff989c-ab70-427b-aefb-dfcd484fefc3	2025-05-23 16:34:37.571
869	anonymous-35cc500a	01d076b5-8336-40ea-9f19-82e278d6e077	2025-05-23 16:37:40.023
870	anonymous-6c131124	36e07ee8-ffdd-485d-884a-560add7f0ec6	2025-05-23 17:02:30.071
871	anonymous-ddf7cd4f	078e0efa-5bf4-42ce-860f-54db5ba7014c	2025-05-23 17:02:30.757
872	anonymous-8cf146e0	dd9a62a9-b412-44f2-8b80-9db5fc929bd9	2025-05-23 17:02:30.796
873	anonymous-d9709884	95e6ac4c-ae3a-455e-9ef5-20664c5ef2e0	2025-05-23 17:02:31.558
874	anonymous-f3992607	273d7aa9-8aed-4aa5-80da-de93a666c249	2025-05-23 17:02:31.732
875	anonymous-1b2f9828	da8eea72-bc5f-43b5-8555-2264d33f25e0	2025-05-23 17:02:32.354
876	anonymous-53b618d4	ba39a0fd-387c-4615-9df7-846e3e21ce53	2025-05-23 17:02:32.381
877	anonymous-d0c717e5	959953db-d253-4ab6-9dcd-d6d694a966fc	2025-05-23 17:02:32.382
878	anonymous-77e6a86f	8f381f52-dc37-4338-8907-f981c66da4cf	2025-05-23 17:02:32.383
879	anonymous-a2494de4	db180d1d-c150-49f1-ad5a-eb08d7748870	2025-05-23 17:02:32.493
880	anonymous-cd47ffbc	84bf33fd-1432-4927-aeeb-16a8148d22ce	2025-05-23 17:02:32.552
881	anonymous-c9b7b354	96df5a30-5716-4df9-824c-8b47605bc167	2025-05-23 17:02:32.729
882	anonymous-f8e85819	7fb9309f-62fe-4fee-9b8d-a96d937442af	2025-05-23 17:02:32.737
883	anonymous-395e4dd1	e7ce6bfb-f71a-445d-8684-359a95b7a325	2025-05-23 17:02:32.739
884	anonymous-9e7540f5	473c6e7c-0119-4e09-bbd2-10e268067da5	2025-05-23 17:02:32.803
885	anonymous-024094ef	ef2d94ee-815c-4d57-a1ff-9fbee8a55e8b	2025-05-23 17:02:32.754
886	anonymous-5d6b19b4	4a72ac30-b538-4ee1-8f82-fb09c39b2255	2025-05-23 17:02:32.844
887	anonymous-acf30972	bd7b69ab-6467-47ac-bdc3-87153e7918a6	2025-05-23 17:02:32.858
888	anonymous-1b3e9007	08916ea4-4216-4c75-9bc5-674859f13b4b	2025-05-23 17:02:32.898
889	anonymous-298fcb24	545f2d8c-08c6-4a18-84d9-ec08c148ed0d	2025-05-23 17:02:32.935
890	anonymous-3dea3b21	1d7d8469-34c4-4294-bdfa-c92c8c120f76	2025-05-23 17:02:33.014
891	anonymous-3fdb0d64	847bdd1d-bfcf-4bab-a66a-9002179beeda	2025-05-23 17:02:33.013
892	anonymous-6fe3adb3	d9c3a562-cd14-41f1-9264-224a5682c863	2025-05-23 17:02:33.025
893	anonymous-660ba5df	2cc0b8f5-89ac-45e5-b3c0-1278f965605e	2025-05-23 17:02:33.026
894	anonymous-4711380b	e6bb0e7d-2b04-41f2-a918-ea15ce214212	2025-05-23 17:02:33.06
895	anonymous-90fed8b0	64f96b06-66bc-4672-afc2-552b58671bbf	2025-05-23 17:02:33.111
896	anonymous-36bd1020	909960af-8b1b-422e-bceb-39bf4b88af05	2025-05-23 17:02:33.186
897	anonymous-017feea2	26c2d08d-0345-4dab-9697-dda4dfd2fe6f	2025-05-23 17:02:33.185
898	anonymous-752e6ce3	bccc9e5d-0b2f-45fa-81aa-0d842ea1cfea	2025-05-23 17:02:33.187
899	anonymous-8f0f3527	41fae45a-1b60-48fc-8f58-d6efcde77ff9	2025-05-23 17:02:33.192
900	anonymous-ec33ba0e	0b685375-e71f-4e47-9560-8c829a010e67	2025-05-23 17:02:33.257
901	anonymous-ef5c6984	c33cb8c6-fde2-41e3-b29c-c29b826eb346	2025-05-23 17:02:33.269
902	anonymous-ecdcc7ca	d200c6b5-9bc5-442d-8f10-9bbf9b389ac0	2025-05-23 17:02:33.365
903	anonymous-c7c6f870	acca7948-360c-42ba-ad44-3ade9f7c36c8	2025-05-23 17:02:33.376
904	anonymous-056931ce	fd51c7c8-60e3-4ec0-b198-a1871d9aa0be	2025-05-23 17:02:33.379
905	anonymous-2845e226	f21455e0-3237-401d-b6e3-fdf083cde289	2025-05-23 17:02:33.38
906	anonymous-e412ea2c	d865dca2-03af-4847-a23d-93fd000904a9	2025-05-23 17:02:33.405
907	anonymous-db0c7e70	aea6adc4-0ba3-4d2b-96cf-486e797c4e37	2025-05-23 17:02:33.482
908	anonymous-23bc07a9	66265f89-96d2-4aa7-9025-9bf32e917d12	2025-05-23 17:02:33.485
909	anonymous-c7d92c8d	450c3c47-b425-4410-9718-bb829e1a34a9	2025-05-23 17:02:33.487
910	anonymous-85184658	2b1daa48-10f4-4f3a-9e84-2e81b097618c	2025-05-23 17:02:33.48
911	anonymous-70855ce2	cd4942bb-5ba4-4ae4-be6a-d1f87f0d7c67	2025-05-23 17:02:33.563
912	anonymous-5e9d473e	92b91ec8-4a72-4de3-a568-9c358f2acbb2	2025-05-23 17:02:33.566
913	anonymous-8adb27f8	3d95682d-5dbf-4a33-a60c-54b1dae5c8e9	2025-05-23 17:02:33.598
914	anonymous-210136d8	d9b2fd23-658f-4876-b03a-63b4238e5346	2025-05-23 17:02:33.6
915	anonymous-e9fb571a	7b788844-fd2c-4223-afb7-272e31272218	2025-05-23 17:02:33.604
916	anonymous-c11aec4c	d51f5345-3613-453d-8721-ef519e5fbb6f	2025-05-23 17:04:42.07
917	anonymous-a5215ecb	1c9734a7-853f-4981-80d3-48b120bc52a1	2025-05-23 17:08:50.671
918	anonymous-7976e3c2	4711b67e-4c02-4372-a513-69337187cc48	2025-05-23 17:08:51.718
919	anonymous-27d270ed	18582124-237b-482b-923f-62708af0d0a6	2025-05-23 17:41:06.702
920	anonymous-1f9f2922	72014f1f-3955-4f37-8abb-5200e37c0909	2025-05-23 17:41:14.549
921	anonymous-124dd168	660ab04f-ad2a-47c4-8cf9-8fd13b369ad9	2025-05-23 17:49:26.323
922	anonymous-3f6c5fa9	4044938c-780b-469e-ae84-cbd38b823d0a	2025-05-23 17:51:12.533
923	anonymous-3d9bd0c7	fb72db05-00b2-4f0b-b064-b05993f15b9e	2025-05-23 17:51:49.934
927	anonymous-788349ad	2b86bcf0-d49a-48b3-9594-9872c36c705c	2025-05-23 18:27:16.821
926	anonymous-ed5cebbc	83317229-4a23-4552-a9b6-391c28030409	2025-05-23 18:27:18.788
924	anonymous-2796b9fb	fef6b59e-cdef-4b19-b883-536fde74ed3e	2025-05-23 18:27:16.661
925	anonymous-942f7c7f	36011395-fb2a-444a-8446-2971faac111a	2025-05-23 18:27:19.603
928	anonymous-ed641dde	86106b41-8d64-4302-b2b7-46a6a057a0d4	2025-05-23 19:00:41.803
929	anonymous-77c34e81	99419c2b-9bb6-4418-b436-b6fcbe8aacf8	2025-05-23 19:00:43.097
930	anonymous-33ac4bb3	505c52f7-e51a-45df-a156-c3bbe2388600	2025-05-23 20:00:58.899
931	anonymous-45cd80c0	e083fdf1-e070-42da-a99a-79be10cda505	2025-05-23 20:01:03.245
932	anonymous-a579e3f6	9b0fdfa4-dfda-4caa-8c6b-3120d1506464	2025-05-23 20:01:08.051
933	anonymous-611dd6d9	2d8ecd4d-6794-4d2a-8859-a7e7db7832c7	2025-05-23 20:01:12.389
934	anonymous-abc2572e	0990f936-e6cb-4f41-93b7-c029d0354cf8	2025-05-23 20:01:16.176
935	anonymous-3c67a924	5f3e6928-886f-4912-87d0-4f751c2bf279	2025-05-23 20:01:18.774
936	anonymous-8c6c48a1	8289254e-3db7-4d55-a487-86eaa9eb74f8	2025-05-23 20:01:21.451
937	anonymous-e624c450	9306867f-9a89-4643-8e53-7d4bf55710da	2025-05-23 20:01:25.112
938	anonymous-945c1dba	f2273c5f-de27-45e4-b50b-d2d8487978b0	2025-05-23 20:01:28.75
939	anonymous-82bfecbc	5df0f6ef-7591-48b3-ab3d-f6a98661f335	2025-05-23 23:30:42.023
940	anonymous-b2ec53d7	076a51c3-493e-447d-b716-32a0e0baa276	2025-05-23 23:31:08.643
941	anonymous-bf3874c4	cbf79307-b75d-49b7-8b76-7e6f7b7f9434	2025-05-23 23:31:08.71
942	anonymous-23aa335a	8d6f5a4c-f8c0-4023-bdab-c296d5d42043	2025-05-23 23:37:05.855
943	anonymous-8df706da	b111e455-d78d-4bce-bc36-4773a58be07d	2025-05-23 23:42:27.655
944	anonymous-d9ac2426	88700fb6-eb71-4149-9bc3-df9029e49139	2025-05-23 23:43:01.022
945	anonymous-91314a06	0e848ce1-1964-405c-9645-4233fab2e85d	2025-05-23 23:43:01.07
946	anonymous-db6c6630	5ec838a5-1826-4d36-83ed-0322cb9a4a92	2025-05-24 00:18:32.662
947	anonymous-d2b402b8	624ca04f-782d-43e0-bdbb-b698d6141c7f	2025-05-24 00:19:06.201
948	anonymous-faa0b7f9	a1a8c767-771a-4ef6-98af-ff0f91c102c6	2025-05-24 00:19:06.258
949	anonymous-ddc53b08	f1fa3332-390e-497c-89d2-e619ac4f8116	2025-05-24 01:07:15.178
950	anonymous-73af3079	8ea55551-c34a-4b64-aefc-fc185af673f5	2025-05-24 01:07:15.19
951	anonymous-bfd951a4	eb28d30e-0c7a-4ed1-ac6c-305f77c533e3	2025-05-24 02:26:14.372
952	anonymous-898cdace	fc308f3c-0b9b-4411-8c66-917250f5f36f	2025-05-24 03:14:40.573
953	anonymous-3720742a	ccb8b8c7-c9f6-40a7-ad20-454235597b8a	2025-05-24 04:30:44.03
954	anonymous-3b5abd40	817d2e9e-5583-4a9f-9d69-a5636f016465	2025-05-24 05:36:32.889
955	anonymous-a1c2bf60	a1ab2335-96cc-4aa6-883f-ad3cd4a6d764	2025-05-24 05:48:42.871
956	anonymous-e93578ff	81f04193-5622-4c97-ba3a-f742d455fffe	2025-05-24 05:59:00.858
957	anonymous-399e461f	702640f8-8bda-45e1-8555-8a5720595d38	2025-05-24 05:59:01.546
958	anonymous-33c425c9	3174094b-25df-436f-b132-006391e96416	2025-05-24 05:59:01.536
959	anonymous-ac2df641	74d49048-9b10-4d14-b42f-faf640421a67	2025-05-24 05:59:01.547
960	anonymous-f8321386	84f21e25-baa4-4fab-bd9a-ab49e52ffe01	2025-05-24 05:59:03.522
961	anonymous-d4fdc426	5e69152c-bff6-48ac-a41e-ede9f1bb6d5a	2025-05-24 05:59:03.522
962	anonymous-0329968e	e88be487-942e-466e-bb83-436f320ea250	2025-05-24 05:59:03.545
963	anonymous-953b9e49	cacdca79-d29d-4c26-8b9f-7e2f976f5369	2025-05-24 05:59:03.659
964	anonymous-7ff27b0f	f92bc133-d0ad-41e4-9b41-b3d816a83984	2025-05-24 05:59:03.666
965	anonymous-6873584a	bcbe9b28-1550-40b2-be2f-3a6b4bb07c56	2025-05-24 05:59:03.687
966	anonymous-9a7762c4	251fd908-2c12-475c-92e0-0fd841490d3e	2025-05-24 05:59:03.776
967	anonymous-5a32f1ac	541d78d6-fddf-45d4-99c5-bcb919be9b27	2025-05-24 05:59:03.777
968	anonymous-ddefc8f0	de2df07d-f19b-455a-ab8d-18529da04a0d	2025-05-24 05:59:03.778
969	anonymous-d129f2c9	4dd40b8c-299d-4c52-a278-b864b76eb980	2025-05-24 05:59:03.805
970	anonymous-a78404f4	ce69ac7f-297e-4435-a124-b0295bcf289e	2025-05-24 05:59:03.832
971	anonymous-c3c6786a	f2427a5e-ae65-4921-875c-6c5c8fe3f799	2025-05-24 05:59:03.854
972	anonymous-247f112b	fdce3816-f7f7-4978-805c-9d2e3a582cf2	2025-05-24 05:59:03.859
973	anonymous-e9a2253b	f4c58cce-394f-4d12-ad09-5f7278196a8e	2025-05-24 05:59:03.861
974	anonymous-2071eebf	443af1fd-919d-4f0a-a09b-4c3aa29ff8f0	2025-05-24 05:59:03.889
975	anonymous-c5354af9	01ecfd83-2f7e-460d-9ccc-81829f6bfe0e	2025-05-24 05:59:03.915
976	anonymous-1c18d898	4d4f80c4-c80b-4b6b-82c7-7ca4a50ea674	2025-05-24 05:59:03.935
977	anonymous-5d4d3575	37e704fc-0d5a-43dc-8606-7a9302f85eef	2025-05-24 05:59:03.868
978	anonymous-c33d6b35	765ee8a6-4e96-4465-8802-3f4fc537678a	2025-05-24 05:59:03.951
979	anonymous-6500d79c	53f20f72-0eb6-4208-b407-8927e860624e	2025-05-24 05:59:03.988
980	anonymous-9b7afc7d	5f7703ef-6037-4f25-96dc-2ce41492c151	2025-05-24 05:59:04.018
981	anonymous-74aa93e5	1ae94fd9-57ba-49c1-a233-a0b898104c51	2025-05-24 05:59:04.021
982	anonymous-5ec99811	8294ee69-221a-49d9-97ef-8845c6edb6ff	2025-05-24 05:59:04.021
983	anonymous-05cecb95	746f82e6-2cc1-44c6-b95d-1635d117648f	2025-05-24 05:59:04.067
984	anonymous-7f69f168	bba5383e-01a9-4940-8962-4c5df73e91f5	2025-05-24 05:59:04.112
985	anonymous-7b71e466	914cd8df-54e8-43cb-a9b5-29fc38283049	2025-05-24 05:59:04.113
986	anonymous-2ababbab	ea0a0efe-0a6a-43c5-9b14-595cfaf1bfde	2025-05-24 05:59:04.112
987	anonymous-bdb29880	a35ec2f6-0e4d-4a4d-93d4-bd646eadc18f	2025-05-24 05:59:04.114
988	anonymous-4b77f9a4	9e710eb7-8182-4e91-ab5d-1b108567dd50	2025-05-24 05:59:04.125
989	anonymous-e6040210	055bc580-e944-4a9f-8c34-17b8c5e0622c	2025-05-24 05:59:04.184
990	anonymous-474e6114	3a7a917c-2645-4465-a986-616ad38a23fa	2025-05-24 05:59:04.19
991	anonymous-0f0d28ef	8b476c1d-e8ac-4bed-9a84-26b57ed60cd2	2025-05-24 05:59:04.196
992	anonymous-4d84938b	26f84c2e-81ff-47fb-aeac-0051fd87f0d6	2025-05-24 05:59:04.204
993	anonymous-ba01f1f0	ef0a6237-214e-494e-ac10-6f8d42feb543	2025-05-24 05:59:04.208
994	anonymous-0f01ec4a	a96030c1-c8ec-428a-b243-eb5fbc5af283	2025-05-24 05:59:04.256
995	anonymous-b47776e1	ccc9a51e-7aca-4795-ba6d-1e78b3d3a701	2025-05-24 05:59:04.271
996	anonymous-6e7716ba	52610fec-08d5-4e64-84a4-f9de7ecbad12	2025-05-24 05:59:04.325
997	anonymous-234170b8	e976b969-2787-4674-aad2-093dfb418601	2025-05-24 05:59:04.34
998	anonymous-148023ca	a0e32ef4-f977-4bb2-a900-70b5de36632e	2025-05-24 05:59:04.359
999	anonymous-00eafbdc	57fbf9b0-99ec-433c-9a44-41c16c8a96a0	2025-05-24 07:24:28.761
1000	anonymous-22e27225	e10b1684-337d-4f37-9315-6275f0e6abaf	2025-05-24 07:54:28.105
1001	anonymous-b2f199d7	ef20054a-ef89-4e09-b362-a78ae1838317	2025-05-24 08:24:28.766
1002	anonymous-34ab126e	94e4e782-37c1-425f-b88e-1caa0ef74fb2	2025-05-24 09:15:21.061
1003	anonymous-f23946e1	e8b3893a-558c-46f5-8071-71e43021b9d1	2025-05-24 10:08:12.311
1004	anonymous-d9326ed1	877e3219-f464-4db7-8c42-0aa18a731518	2025-05-24 11:10:09.753
1005	anonymous-9553f618	64df3dd3-b1c9-4875-a76d-1d9b1227ce17	2025-05-24 11:10:15.695
1006	anonymous-3b9d92c3	fff2f224-6190-4622-baca-86f2248ad61e	2025-05-24 13:54:22.601
1007	anonymous-60955881	afa12669-04da-4800-bb0a-8641ee79266e	2025-05-24 13:58:31.769
1008	anonymous-f76853be	57dea36b-afc8-413e-bdc2-0c537e34ee83	2025-05-24 22:35:15.358
1009	anonymous-f5ed4570	c156bab1-cd08-46bf-aa38-8af5e743261e	2025-05-24 23:32:11.965
1010	anonymous-bf6849f6	2e09f770-dab5-4e1d-b14f-2b012f25b6e3	2025-05-24 23:32:13.007
1011	anonymous-23337d86	18896469-c75c-44f7-852d-b525b3e72e10	2025-05-24 23:32:13.009
1012	anonymous-6d629ca9	4ed908ba-9597-4b1d-91ac-cb5503597e5b	2025-05-24 23:32:14.222
1013	anonymous-aa49fdbb	5caf4646-45c3-4352-98df-e93ceeef5c60	2025-05-24 23:32:14.468
1014	anonymous-e0a95f86	046e13a6-d01a-4445-b57e-19b86f46c963	2025-05-25 00:25:58.135
1015	anonymous-07c7c2ce	6f07c9d6-6085-45f6-9688-033b17fe2c47	2025-05-25 00:47:21.611
1016	anonymous-5367dd20	a025556b-1444-412f-8042-3bd577988484	2025-05-25 00:47:21.615
1017	anonymous-fd30c796	096bbefc-990b-4c9d-bf96-1b2ad2d62298	2025-05-25 00:47:22.088
1019	anonymous-597df611	b73bfb23-cd99-4d08-94ce-45f0fa026a65	2025-05-25 00:47:23.275
1018	anonymous-d3635988	4434807f-4428-447f-a809-feda6ac20f11	2025-05-25 00:47:23.281
1020	anonymous-26329aa5	6ee7eee6-66e2-4c2b-8f7c-88a3f977aa11	2025-05-25 00:47:24.517
1021	anonymous-e454a0a0	df48771c-aec9-4568-a275-d4eeac066d63	2025-05-25 00:47:24.635
1022	anonymous-b81ca607	d07a373b-55b9-4583-850b-103d41e9e1ee	2025-05-25 00:47:24.96
1023	anonymous-1e99fcf3	09d5ab10-616b-486e-81cc-e090327eabeb	2025-05-25 00:47:26.773
1024	anonymous-fd69b255	2ce0acf5-6ce4-4453-9405-31b10039e814	2025-05-25 00:47:26.773
1025	anonymous-bad62a50	978f0cf1-a813-4f63-adf3-eb28926a127a	2025-05-25 00:47:26.829
1026	anonymous-4774349f	24b59d6c-168a-4410-871a-835cdffb0378	2025-05-25 00:47:26.834
1027	anonymous-0893c4ad	4ed33691-1281-4461-8d53-d3105de5f29c	2025-05-25 00:47:26.797
1028	anonymous-2cfdb416	03966cb6-e5f7-48e9-883d-625d08e7d106	2025-05-25 00:47:26.925
1029	anonymous-bf83ff64	43bac332-d858-4746-9f5b-fac5a3495e3b	2025-05-25 00:47:26.927
1040	anonymous-685c459d	fc8b3bd9-8141-4c23-b244-069de8e117f0	2025-05-25 00:47:27.084
1042	anonymous-ac8a3cc7	804b5596-5788-4a56-b3bf-77cbc1ad49a7	2025-05-25 00:47:27.132
1047	anonymous-0b8c0c51	8e160782-c4af-4b69-93f9-1694ba96189e	2025-05-25 00:47:27.222
1052	anonymous-54b19d2e	2f41ab33-67a0-4e30-9733-3a655530a2e6	2025-05-25 00:47:27.303
1030	anonymous-18f20cac	ebf69763-862f-43c8-b333-d65a570b5ba7	2025-05-25 00:47:26.929
1038	anonymous-8acad8ce	96afb84a-46f7-4e3d-8575-28f05bd3c657	2025-05-25 00:47:27.012
1045	anonymous-f8115b1f	216df9ef-4ce2-4aa2-b98d-b3fea0b40bf8	2025-05-25 00:47:27.17
1031	anonymous-c38fd6e2	4bd87929-45e4-4f99-a36c-22478a0a5618	2025-05-25 00:47:26.931
1044	anonymous-96cf7f7c	84ebea06-7e22-46a9-a87a-96a24fc19ffa	2025-05-25 00:47:27.151
1048	anonymous-a9b0cbc6	5506cd73-f443-479c-8dce-604017e1ae4a	2025-05-25 00:47:27.22
1054	anonymous-a16ecd09	0c7146cc-f02d-4246-ad78-03e78092a647	2025-05-25 00:47:27.343
1032	anonymous-03633c3d	ec6464f5-0a02-4589-8eee-f901b1b7d9b2	2025-05-25 00:47:26.931
1037	anonymous-4f821325	ef1de473-ca29-4099-9a7f-6385eebde4c2	2025-05-25 00:47:27.006
1050	anonymous-bf4adbb4	141cd03f-1a63-4d63-bb0c-c898a3548792	2025-05-25 00:47:27.237
1051	anonymous-fac516f3	10ae3b5f-fdca-47bc-a2fb-7a03fe5d979e	2025-05-25 00:47:27.295
1053	anonymous-c95dc81b	50267899-d851-44b9-82bd-4f4b84d5ca7b	2025-05-25 00:47:27.341
1033	anonymous-97bb14cf	46864ecb-d26b-43e7-b0c9-d936ff7dbd37	2025-05-25 00:47:26.987
1039	anonymous-bc95acd7	ba1435cc-3aca-487f-8930-bedb593e2c06	2025-05-25 00:47:27.075
1034	anonymous-75be3624	45610ffd-96e1-43e3-a0a1-dd17dd2ea439	2025-05-25 00:47:27.011
1035	anonymous-f32c3cb4	009fe4d3-5295-4297-8e3b-2fb5f5e62ebd	2025-05-25 00:47:27.019
1036	anonymous-4626da5c	883d523d-295e-4d4a-bb88-6cd2afe0eae9	2025-05-25 00:47:26.997
1041	anonymous-8e3cf833	66e54fde-cb13-49bb-be79-d2b4efe8cd8d	2025-05-25 00:47:27.116
1043	anonymous-08cd8590	bf2b68ac-32a0-4c28-a2f8-2df02cd7643e	2025-05-25 00:47:27.134
1046	anonymous-0ee64369	111a7a4b-2a3d-483d-ba9a-62351dd10d18	2025-05-25 00:47:27.155
1049	anonymous-e4e51577	a4e394ef-21f1-4c10-a1e9-6e9657d7a8b3	2025-05-25 00:47:27.223
1055	anonymous-f59b966f	caef17e3-8dc2-4b2b-ac28-d3b092108dd5	2025-05-25 01:01:51.338
1056	anonymous-4a4638cd	7518ae21-8984-404b-867b-8ceb8fa260df	2025-05-25 01:01:53.572
1057	anonymous-3172579d	bacbbfe8-a4c1-42a2-9bfe-b74488f29168	2025-05-25 01:01:54.632
1058	anonymous-654f1eb6	f79ef89d-b17d-4d5d-ae0a-2c020c86b444	2025-05-25 01:01:53.579
1059	anonymous-e5872fda	09f4dbec-32d1-4e45-8a65-36a53ce1288b	2025-05-25 01:01:55.169
1060	anonymous-10391b22	904e215f-a807-4560-9ae3-d73e156ef89b	2025-05-25 01:01:55.019
1061	anonymous-3ac71742	a92dae71-7b42-4202-89a5-6d9dd396f6c3	2025-05-25 01:01:55.027
1062	anonymous-1dfa5cc9	bf02b5bd-e4b5-44e1-a7ec-348efe12f7c2	2025-05-25 01:01:55.268
1063	anonymous-df82372c	fe219fb4-cc1e-4ebb-9aea-f45baaefa2ab	2025-05-25 01:01:55.306
1064	anonymous-50c8b279	bb34839f-c8f3-492d-bdd2-2850d1e52ff8	2025-05-25 01:01:55.323
1065	anonymous-5d6bc70c	1b0f9ad6-8fd9-4762-a852-b5dce63bf572	2025-05-25 01:01:55.325
1066	anonymous-d731e5ae	62984e53-b5f8-489b-a30a-becb0dde2735	2025-05-25 01:01:55.371
1067	anonymous-82dcebd4	4450dd78-a5c0-4793-a862-6c0a5317c168	2025-05-25 01:01:55.375
1068	anonymous-6331b8eb	9bfeaeca-ad7e-404b-b0ee-989b3bc5e98a	2025-05-25 01:01:55.391
1069	anonymous-1304ed2d	f2410b54-5297-4050-bfc7-8b426911ebbb	2025-05-25 01:01:55.419
1070	anonymous-0042dbb9	3381c528-0c62-4ac2-9fd8-04d25b90f263	2025-05-25 01:01:55.439
1071	anonymous-7eb99d56	a58d9870-cbe5-47f4-b9a9-5bca467d34b0	2025-05-25 01:01:55.464
1072	anonymous-2bff556a	fadf239e-0abf-44e5-9a75-41b3505c4b90	2025-05-25 01:01:55.464
1073	anonymous-b468f463	2d2e8732-f067-493c-9b0a-2e4efdeaed7b	2025-05-25 01:01:55.472
1074	anonymous-9ce9053a	99650243-70a0-48b7-a0e2-f4548b0f9022	2025-05-25 01:01:55.527
1075	anonymous-087b78ee	0eb4055b-0d77-4768-9277-3f153f89dae6	2025-05-25 01:01:55.541
1076	anonymous-87e1e574	dfad860e-4e4c-42be-99d3-3ecc7f3225d6	2025-05-25 01:01:55.578
1077	anonymous-5aa42b66	0c46ca1a-b1ff-47a9-ba76-bebafa7884fa	2025-05-25 01:01:55.597
1078	anonymous-6d81f802	531eaec8-cdd3-4846-8928-8c0480e12332	2025-05-25 01:01:55.619
1079	anonymous-eb098c1a	064687af-2668-4338-b439-6a733e28600a	2025-05-25 01:01:55.619
1080	anonymous-ebd52dfe	da574660-d03c-47d8-be0c-ead82935a570	2025-05-25 01:01:55.652
1081	anonymous-f8d0f060	93a24bd4-3c08-49df-b73b-b5a87d423737	2025-05-25 01:01:55.653
1082	anonymous-9ecd74fc	4dc0161b-3f6b-48a1-8f42-63b9fb251929	2025-05-25 01:01:55.675
1083	anonymous-660c4f74	09eae783-bb2a-4739-a713-eb95bdd0809e	2025-05-25 01:01:55.704
1084	anonymous-b65bd986	70f7314d-7a65-4238-8b30-b9874fa2ce98	2025-05-25 01:01:55.712
1085	anonymous-d06c8311	9351d1d5-6658-4dbb-bd1f-f515863b68d0	2025-05-25 01:01:55.719
1086	anonymous-152fdd75	e0ca6855-8782-4a06-8b4a-3fe5cd791731	2025-05-25 01:01:55.728
1087	anonymous-83d45d03	170d55cf-ef80-4345-95eb-54389d92bf21	2025-05-25 01:01:55.792
1088	anonymous-3a7234ed	9d08c32c-1495-464f-81df-e070021d3666	2025-05-25 01:01:55.809
1089	anonymous-0624b69b	5ef06753-cc62-4f0c-9144-b5019d82722c	2025-05-25 01:01:55.81
1090	anonymous-76b4a180	a00c561e-5788-4cb1-ab97-cf70f86fe190	2025-05-25 01:01:55.877
1091	anonymous-88979791	b1ad5234-f70f-4e4c-9311-f6fb5c0ad512	2025-05-25 01:01:55.884
1092	anonymous-dae06f15	1c70ca3a-f765-4b12-a92d-c10a82593afa	2025-05-25 01:01:55.896
1093	anonymous-7aaaaf82	4a695e6c-e251-42c0-8bf2-db02467b7c14	2025-05-25 01:01:55.975
1094	anonymous-ce1bf43d	28848926-bcd4-4875-bbb8-c69121a2eaca	2025-05-25 01:01:56.006
1095	anonymous-57540344	eaa17fb4-2029-4b8e-97e6-59b1c1294eee	2025-05-25 01:05:52.732
1096	anonymous-8e439f88	691f6295-51c9-45a2-94a7-5b268e64b9da	2025-05-25 01:34:20.89
1097	anonymous-ea7fdf7c	015a2586-858d-472e-b050-0f7ee3bd308a	2025-05-25 01:34:58.664
1098	anonymous-78bd521c	7d3ad08e-c0fd-477e-8a86-c2ba8dd2b118	2025-05-25 01:34:59.099
1099	anonymous-e393f949	89596a1d-0a27-412b-b084-bec12cdd04b9	2025-05-25 01:34:59.101
1100	anonymous-8f8ebb17	d43453a0-bb58-42a5-b4d7-7cd19d62525a	2025-05-25 01:35:01.071
1101	anonymous-c400ae64	73acc680-33cb-4271-b320-f3fba61256c8	2025-05-25 01:35:01.273
1102	anonymous-4ee0c37e	b2fcb174-b5c6-4804-a41d-2f6b681258ca	2025-05-25 01:35:19.404
1103	anonymous-5efa3b25	e073c14b-982e-41f3-986c-8a797058f04d	2025-05-25 01:35:37.706
1104	anonymous-9af62971	badb2840-44e1-485c-91bf-116dfbb01be5	2025-05-25 08:38:00.411
1105	anonymous-c262d3ca	fbc3d643-b661-44ef-91d5-b5f5adde2d41	2025-05-25 12:44:45.47
1106	anonymous-38668e21	1bd7ee22-f2aa-4c5e-a59b-f1c49f96423d	2025-05-25 13:38:20.109
1107	anonymous-63da2bcc	779586f7-1c8c-4fbe-95ba-af6e3e100dd7	2025-05-25 13:38:21.438
1108	anonymous-fef4db54	58f4ed0f-93cf-4e6e-91f9-4f451ec0c1f2	2025-05-25 17:35:30.606
1109	anonymous-9eddea52	feb96472-33ae-416d-8d80-7e4d81f4e77f	2025-05-25 17:41:18.596
1110	anonymous-a3da8185	1140d800-2160-48c3-bc7e-c40a9bb955df	2025-05-25 19:33:27.326
1111	anonymous-a519be68	a6cb7417-6324-40c2-b77e-b3943e60880f	2025-05-25 19:52:31.474
1112	anonymous-8bb0fe6e	e94892a4-ed19-4a73-9cb3-b24e1fb7b3af	2025-05-25 19:53:24.16
1113	anonymous-805b7da4	26ed721f-6344-443b-a3bf-d63b508fb6ec	2025-05-25 19:58:10.139
1114	anonymous-80d49dc0	0651ed5c-6291-4e03-96cd-1819208ced49	2025-05-25 22:24:34.616
1115	anonymous-f90201d3	a7b37f23-387f-4634-83fb-63e45fe34136	2025-05-25 22:26:17.435
1116	anonymous-5574a325	8790a098-d937-4da3-964f-81de4651d196	2025-05-25 23:05:50.295
1117	anonymous-ae1fe782	5746a27c-5e65-4948-ac75-0e1fd05f8ebb	2025-05-26 04:25:02.504
1118	anonymous-83bd554e	f58ec961-f6bc-441d-9f27-b7ec6289bcf5	2025-05-26 04:25:08.76
1120	anonymous-5af1e61e	dd5fe3b5-6fd4-4bc4-b5a1-21c7599e4cbb	2025-05-26 05:14:19.718
1119	anonymous-8743aa5b	5de233a3-0ed8-412c-8ece-a4cfab84f366	2025-05-26 05:14:19.052
1121	anonymous-b7364d50	6bd6cb49-3c13-4ddb-9da4-b6debe23750e	2025-05-26 05:14:45.125
1122	anonymous-dda7668f	7a0b45a7-1a0c-4ebf-b15f-b08396e2b6e8	2025-05-26 05:15:51.695
1123	anonymous-5650fc8b	77c9b814-b7a9-4bcd-9c6b-19cada9b5132	2025-05-26 05:16:54.911
1124	anonymous-d4776a82	a2cbbb83-596a-4df6-83cb-a1fc198efb59	2025-05-26 05:17:48.884
1125	anonymous-dfcee0f4	94fd001a-80e6-49f7-9222-e0393fd28f60	2025-05-26 05:18:46.215
1126	anonymous-be2d7b04	e856c733-f6bc-4a66-925c-203e2dcc570c	2025-05-26 05:19:08.119
1127	anonymous-7fac7b7d	20f8036e-9f3b-44d1-aa34-89963841ca35	2025-05-26 05:19:47.63
1128	anonymous-c63c098a	0d737c9a-f316-4d13-a699-2ed2ab80d01c	2025-05-26 05:20:48.902
1129	anonymous-20a345a6	bf169fe3-1b6f-48ee-9f5e-16c0aff0f91c	2025-05-26 05:21:49.78
1130	anonymous-a793c412	df65ea18-191b-41cf-b819-40c2c7eb79dc	2025-05-26 05:22:54.247
1131	anonymous-a6decf75	33dcefc5-7436-47b9-8c08-f3f2fa0e76ff	2025-05-26 05:24:05.078
1132	anonymous-10bfbd8c	17dfd8c6-6191-40a5-a9a0-84af824c74c2	2025-05-26 05:24:05.484
1133	anonymous-de8b5378	9da22370-8e0c-4f42-bce4-c6405c26ffea	2025-05-26 05:24:05.485
1134	anonymous-3f97f728	46e5e1dd-4c2f-4089-8b6c-5de11072acbe	2025-05-26 05:24:08.222
1135	anonymous-a5007633	3cd66c46-36fe-4299-a8b5-92ce9350df85	2025-05-26 05:24:08.472
1136	anonymous-fb8a3133	afe2044b-704e-4c44-b80c-dba6de623d7a	2025-05-26 05:24:09.588
1137	anonymous-e1c189fd	cdc4422a-4162-4edc-9661-14292820fb9a	2025-05-26 05:24:09.769
1138	anonymous-2a480401	e5d04a82-c560-4fb3-bfc7-2320c06a7a76	2025-05-26 05:24:09.77
1139	anonymous-9fffc8a4	be2b2310-3e57-43c3-8b4f-63cd2a1983bc	2025-05-26 05:24:10.017
1140	anonymous-f9124faa	ef35bbdf-74d1-4ff8-b696-f9c9ba4afc19	2025-05-26 05:24:10.223
1141	anonymous-056a7c01	ebe40c86-09dc-4748-825b-788e12aa15f8	2025-05-26 05:24:10.427
1142	anonymous-13ee1ddb	e0ea086c-9956-4b80-b55a-e9b49bbd36aa	2025-05-26 05:24:12.12
1143	anonymous-bc27918c	26eabcb0-925c-488a-bac0-82c069295789	2025-05-26 05:24:12.416
1144	anonymous-d50dce5a	32977e10-f938-4f9c-81b5-f3922ee00eeb	2025-05-26 05:24:12.429
1145	anonymous-0ef58652	ac51b72a-c9a2-426a-9a77-f9188a6376f5	2025-05-26 05:24:12.666
1146	anonymous-b4320317	14b4fbb0-0ef6-4e97-9e30-d716efff92d9	2025-05-26 05:24:12.856
1147	anonymous-3387e2c8	30769c90-2b29-493b-a74e-a3696997885d	2025-05-26 05:24:13.034
1148	anonymous-d2af7bae	c4c88957-7338-4ddc-acae-f8b728ec3bd0	2025-05-26 05:24:14.601
1149	anonymous-8eefe82f	03d5c41f-ed57-40ba-8dd1-3de5cffc168a	2025-05-26 05:24:14.818
1150	anonymous-c0e2046e	da08af92-3e4f-4bfe-a7df-c662c310fb3d	2025-05-26 05:24:14.827
1151	anonymous-1ee52ce0	a65ce96d-12f6-4868-a61c-3a4c6629a9cb	2025-05-26 05:24:15.032
1152	anonymous-24b3da33	f75e451e-4b66-4524-9a8b-6ca4f4b552fc	2025-05-26 05:24:15.214
1153	anonymous-d6f595a3	d6e3b252-121f-4ae9-a7d7-e378cb678a87	2025-05-26 05:24:15.401
1154	anonymous-b10cb746	c5ad4cb2-d426-4005-8ba7-604802266b6a	2025-05-26 07:39:35.903
1155	anonymous-20c9a8b9	5ea05828-ff41-4ccd-9f7a-d82f7b6a47d6	2025-05-26 08:29:37.321
1156	anonymous-a617d401	f68d5fdd-e7d7-4e0e-bf15-64a85dff3757	2025-05-26 08:29:56.03
1157	anonymous-d402714d	b49a88e3-a22b-4ab3-bff3-6ef5cb3ff389	2025-05-26 08:30:07.172
1158	anonymous-366c911a	c074be01-3a62-4f6d-90d7-2ad57955cb69	2025-05-26 08:42:03.841
1159	anonymous-ab9777f4	f2638c2f-a04f-4723-b643-5455139ffbae	2025-05-26 22:35:31.361
1160	anonymous-c81bf4e0	9a9cf37d-3e6b-4191-bf41-49c2f587bc82	2025-05-27 04:35:06.592
1161	anonymous-d6567295	1f8d7683-5a03-4ce5-962b-c3047ca90f27	2025-05-27 06:50:20.672
1162	anonymous-e2882960	411d0b0c-f1e6-4adf-ac09-cfeffa66723d	2025-05-27 08:04:37.68
1163	anonymous-1099e56a	a9e83ed1-571f-4ef1-942f-bbc35f7d55a4	2025-05-27 12:49:49.372
1164	anonymous-3fd1fe17	8eb38320-96c5-4665-9b47-3c3b05e191be	2025-05-27 13:01:45.723
1165	anonymous-6927514c	a43afa14-81e2-487b-ae6e-8f0dd615bd47	2025-05-27 13:02:45.999
1166	anonymous-b06aa81a	84a1a160-06a1-4dc0-acb7-cb43edc8ec54	2025-05-27 13:15:33.419
1167	anonymous-db1a19e2	aaa837ed-15d8-4282-864d-8380f99a4641	2025-05-27 13:16:59.543
1168	anonymous-f436d245	135346bd-0271-424d-ad02-d018c42ccb9c	2025-05-27 13:23:42.198
1169	anonymous-6ee9726e	5b9f5909-0290-4b75-b8f9-f6ac72e93a55	2025-05-27 13:34:08.293
1170	anonymous-c40ae150	5d5dd99b-e614-4b85-adc2-f2a3b0770c9b	2025-05-27 13:34:09.577
1171	anonymous-34aad493	889be8a3-d895-4e09-a4ac-b56d65f90f0f	2025-05-27 13:52:03.526
1172	anonymous-d63430e1	fd19c259-13a6-4679-b0e8-6ddff9eb86d7	2025-05-27 14:00:22.189
1173	anonymous-9b66a736	dc9bd036-bae9-456f-a918-01b80131ff71	2025-05-27 14:11:42.851
1174	anonymous-4c277a2d	418d8b2c-121d-4a47-bc23-1a0b9264767a	2025-05-27 14:38:40.793
1175	anonymous-269b4b41	4d5600c6-1ed4-4a4c-b353-c9ab3f8600e5	2025-05-27 14:47:23.126
1176	anonymous-aa76caa8	709b3276-b22b-49e2-a824-a5d7ee4d547e	2025-05-27 19:54:40.614
1177	anonymous-58a8f444	1739e101-1bac-4d0b-a7da-d72ee4f6e9bc	2025-05-27 20:35:56.912
1178	anonymous-88f6aa1a	1bf9559c-8694-4d8a-9909-83c28274624d	2025-05-27 21:05:16.387
1179	anonymous-5982d259	a8ffc353-8b75-4fbc-99d5-8315b51f77e7	2025-05-28 02:53:45.877
1180	anonymous-2a159167	ecc1e264-1fac-4c48-aeb3-9abd1b2f1b8c	2025-05-28 11:55:20.727
1181	anonymous-00fa80d7	0b156de0-1cc9-4231-82e3-e8552a952171	2025-05-28 13:50:17.477
1182	anonymous-e3346306	d669b491-92cb-42a3-a670-d867f116be17	2025-05-28 15:41:41.368
1183	anonymous-101798bd	9e21074c-0b3f-4204-8069-279a7b98c2b4	2025-05-28 16:09:26.616
1184	anonymous-e69e2557	109e33fa-72c1-445b-9e60-22a033e374a2	2025-05-28 16:57:38.676
1185	anonymous-f0d7b166	667eff86-655d-4391-96d5-db5e79fa7319	2025-05-28 18:31:05.63
1186	anonymous-30d48e12	b5c87320-006e-4725-b5a8-67df8e335f40	2025-05-28 18:32:08.107
1187	anonymous-a75f0192	c5143676-a5bd-46a5-9458-5e3bcbe6bc9c	2025-05-28 18:32:55.853
1188	anonymous-f3ef6c49	25b369cb-23e6-48bd-bcf9-c578b510f6ca	2025-05-28 18:33:02.012
1189	anonymous-36f952d7	8bc00e9a-2a47-41ff-aa39-9e7ba63e063a	2025-05-28 18:33:57.51
1190	anonymous-f382254b	c7e8021f-0b62-49b8-8c55-5bbc4a7ae838	2025-05-28 18:34:44.038
1191	anonymous-669ff98c	de5338a4-fe8a-4c76-8986-0ff1540fffbc	2025-05-28 18:37:46.916
1192	anonymous-120b73a8	af10a6e7-f078-4418-9493-cf14af62dd00	2025-05-28 20:00:29.528
1193	anonymous-9150e612	5e61d052-d758-401a-bc88-fcd4eee7937e	2025-05-29 03:13:47.024
1194	anonymous-106aa4a8	77c1be62-ae1d-4807-80d7-383232c15713	2025-05-29 03:13:47.029
1195	anonymous-1f2d7250	01c2d4ec-4bdc-492a-96fe-4a2131d989b4	2025-05-29 03:13:48.821
1196	anonymous-2c8b0281	1c80f460-d3df-45cb-9e26-15eb348ef763	2025-05-29 03:13:48.826
1197	anonymous-bf99bef0	cc5d9040-2bbb-43fc-b160-5ca2299e95c0	2025-05-29 03:13:48.824
1198	anonymous-85cb7608	81cfb80f-7ce4-4cda-bcd0-3a8555d24539	2025-05-29 03:13:51.092
1199	anonymous-dcd7975e	10df3d35-8ec4-4c4d-91fa-9377396995ef	2025-05-29 03:13:51.117
1200	anonymous-ae334dad	a3566e90-3626-40b3-92f0-b3a6e5c4701b	2025-05-29 03:13:51.122
1201	anonymous-5b042bca	943c4e68-75c2-4775-b719-cd611be08f1e	2025-05-29 03:13:51.289
1202	anonymous-a0efd793	10907125-072e-4f16-ac37-85342559cb18	2025-05-29 03:13:51.318
1203	anonymous-27523eb3	f622c9d6-6098-4d10-b877-0ffe41022278	2025-05-29 03:13:51.418
1204	anonymous-74b6da92	a4e9f2d5-023c-4c08-bf6e-ecc0515d7096	2025-05-29 03:13:51.496
1205	anonymous-0027ddcf	4c934a30-00bf-4e7d-b167-6c2f2f2efa94	2025-05-29 03:13:51.503
1206	anonymous-f733c9b1	e7b12455-939c-4019-8baf-8b087e5e4ac1	2025-05-29 03:13:51.54
1207	anonymous-fba5b9d9	3e4083e3-8312-435b-9a2f-468df111218c	2025-05-29 03:13:51.541
1208	anonymous-6b270b6e	2067812f-e6ae-4753-803b-e6f237e8836d	2025-05-29 03:13:51.637
1209	anonymous-9cb4d774	0369b3fb-c45d-428f-8ef8-e643335ae85f	2025-05-29 03:13:51.636
1210	anonymous-a2a109f5	00f76bfb-f6ce-43be-aecc-cac3760ed2ff	2025-05-29 03:13:51.64
1211	anonymous-ace4ea86	d764f0a0-1358-4c16-89ed-5219543369fc	2025-05-29 03:13:51.638
1212	anonymous-81333265	3e7c1d31-2713-45d8-a7d3-8441e39da77e	2025-05-29 03:13:51.639
1213	anonymous-ade3a5d2	10d1328b-73ae-47d4-8198-35c424a9922c	2025-05-29 03:13:51.641
1214	anonymous-a5209e75	8a09db0f-e705-4862-a3b6-12bc12c2f8fd	2025-05-29 03:13:51.734
1215	anonymous-67512332	4195e9fe-67c8-4e9b-a9c0-eedbd8588b9c	2025-05-29 03:13:51.738
1222	anonymous-49b18582	6986f9d6-90da-4976-a58f-501062cc0056	2025-05-29 03:13:51.838
1223	anonymous-1a32fe35	5e947b9d-56c0-49f8-8ab9-a035e6cc476c	2025-05-29 03:13:51.888
1226	anonymous-947eed71	7dc3b7f4-0593-4dda-a788-4dc2344ab5f6	2025-05-29 03:13:51.93
1228	anonymous-0421d749	a150b4af-6b02-43a5-a3e2-79b6c7cefaf1	2025-05-29 03:13:51.986
1216	anonymous-307141ed	6e5fd239-9d6b-4866-a270-d1e5b657edd3	2025-05-29 03:13:51.738
1217	anonymous-ec514f04	971d5f18-5966-4256-8758-4a82d0a9889a	2025-05-29 03:13:51.741
1220	anonymous-9a83194d	db8c7f28-f4ac-495d-aa5f-62ef573ae479	2025-05-29 03:13:51.837
1221	anonymous-31ac22a3	1f2057a6-c8ab-476a-aca1-083d43162b08	2025-05-29 03:13:51.836
1224	anonymous-bc08189e	7b3d4146-d240-48b4-8dc8-c08d0aabe798	2025-05-29 03:13:51.889
1225	anonymous-cde854d1	39cbaef5-5230-4efc-9d5f-aeebc7c70f85	2025-05-29 03:13:51.929
1227	anonymous-d3855539	5b8f3eda-fa8e-475f-8195-8bd3f6efeb7e	2025-05-29 03:13:51.93
1229	anonymous-323d9b9a	4d2dbc44-e342-4d58-9300-3d6b16e3a573	2025-05-29 03:13:51.987
1218	anonymous-5cbf1acf	89dd2e45-1b59-49b0-9842-4d285784b319	2025-05-29 03:13:51.795
1219	anonymous-6b82f5dc	c78fc598-cc86-4f1b-b027-65adba32b64c	2025-05-29 03:13:51.83
1230	anonymous-ea669f4a	695c3bbf-2c42-483c-8dbb-cbf67f2234ed	2025-05-29 03:16:58.862
1231	anonymous-d7b727ee	ef61937f-7637-4af5-a24c-3efa3623af2a	2025-05-29 03:17:01.434
1232	anonymous-1d28ca8a	058c6c1d-dba8-4ffd-9afc-06ee6e219893	2025-05-29 03:17:01.446
1233	anonymous-34830743	8536862c-39d4-4a3e-97e6-e4a5f6bbeffe	2025-05-29 03:17:01.595
1234	anonymous-2b104e15	22082b1a-1f54-4584-bdb7-c9dedc6239a5	2025-05-29 03:17:01.609
1235	anonymous-b770f7a3	0f71d154-5506-4565-be5d-eb3dd8f0e24a	2025-05-29 03:17:01.621
1236	anonymous-31785d19	1fef3af4-07b5-4aed-bcfa-fdb8587e46b7	2025-05-29 03:17:01.623
1237	anonymous-64210f94	6d278a92-9126-443f-8ba5-66838c6e3111	2025-05-29 03:17:01.713
1238	anonymous-7cf36f38	a34d1e1d-35ca-4722-a01c-0d333b417f5f	2025-05-29 03:17:01.716
1239	anonymous-a81bfd38	d3dc678b-07ab-4e9c-95d6-8a67e2d7ed9c	2025-05-29 03:17:01.711
1240	anonymous-f4e73282	80e40851-f2fd-47b8-94f8-3962a04a5b24	2025-05-29 03:17:01.809
1241	anonymous-9f42cd96	3ee83bbe-8d0d-413d-8d02-374a8c5fabd4	2025-05-29 03:17:01.822
1242	anonymous-03ce93a8	820eba95-5f5f-483d-a683-b749ded1ce2c	2025-05-29 03:17:01.853
1243	anonymous-70565510	e89241dc-19a1-43a5-8e55-e60d746b18bb	2025-05-29 03:17:01.854
1244	anonymous-c0194abb	0824d136-f243-4ac5-b219-8d15162f173a	2025-05-29 03:17:01.853
1245	anonymous-9164f63e	9e3bdfbc-4a4c-4214-a17a-0152a481ab0f	2025-05-29 03:17:01.856
1246	anonymous-26dfda51	5fe543e1-80d4-4256-8fe9-86e34b9e8835	2025-05-29 03:17:01.879
1247	anonymous-a3a6aae8	99186986-6f86-4518-ad3d-2ba19cdd0f17	2025-05-29 03:17:01.891
1248	anonymous-3322dfd1	3f9b38f5-04d7-4318-a12c-d509981638e4	2025-05-29 03:17:01.919
1249	anonymous-ebfaf8fb	bdde88e9-c6fb-4822-91a4-20c2c168ebfe	2025-05-29 03:17:01.919
1250	anonymous-fe8479e5	2d2d0ba0-d8ec-46c8-83f3-acd44dee06c2	2025-05-29 03:17:01.924
1251	anonymous-77febf73	e3107982-e09f-4650-8b88-7d2a03e5c215	2025-05-29 03:17:01.925
1252	anonymous-2aa4c4ad	ab6a949f-8a74-4f67-9207-af797b6b65da	2025-05-29 03:17:01.94
1253	anonymous-f0ade46e	a3676ebd-6338-43be-8ff6-91f4cb7cf4a9	2025-05-29 03:17:01.962
1254	anonymous-5e464d57	29ee141a-dc2a-48ca-9141-ca28c3c577c2	2025-05-29 03:17:01.99
1255	anonymous-47417724	c8a091f5-3200-40cf-8fc3-725774562538	2025-05-29 03:17:01.991
1256	anonymous-8cbfe697	22a45e2b-c02b-4e5c-ac13-fb342b031d97	2025-05-29 03:17:01.995
1257	anonymous-f816ceed	16234cde-14af-44c8-bdd2-084f0a85135e	2025-05-29 03:17:01.995
1258	anonymous-b4a55fe1	d4670399-75f2-4c48-a3fd-2b41d247e493	2025-05-29 03:17:02.009
1259	anonymous-98eb6bdc	86afe358-e807-46cf-a27d-97052b37bdf1	2025-05-29 03:17:02.026
1260	anonymous-d60f6ad3	5bc52eea-fc53-484c-a8f7-832ae04e7e19	2025-05-29 03:17:02.054
1261	anonymous-62cd9784	202be3da-c58a-4a20-87e5-788f1b8ceca9	2025-05-29 03:17:02.065
1262	anonymous-47cb75d8	382d40b3-b9fc-4420-98d2-e2e6d2859b51	2025-05-29 03:17:02.067
1263	anonymous-81fbeec6	0ce33663-f279-4848-be0d-c7c146615406	2025-05-29 03:17:02.098
1264	anonymous-45ce2de5	a2a4d604-2065-46bc-b3f0-7143e216da5f	2025-05-29 03:17:02.122
1265	anonymous-3ac9553c	52c1d31c-c8d3-4bf9-b67f-74cfbdf8c493	2025-05-29 03:17:02.13
1266	anonymous-19c17316	2e602f3a-8e1d-4337-8434-6f4091a1cb6a	2025-05-29 03:17:02.135
1267	anonymous-bd4e5a82	183116ca-3d34-4990-aad4-638543d9bde2	2025-05-29 03:17:02.172
1268	anonymous-5c9634c0	05923ace-65a1-4c78-a0fb-dc4fc4dd7215	2025-05-29 03:17:02.189
1269	anonymous-c285df58	49c9f7fe-1f1e-4bba-97cb-616ce3bd9374	2025-05-29 03:17:02.193
1270	anonymous-ff8db9f5	0e1fa79f-d2d4-43df-82c2-79ee8e664708	2025-05-29 03:17:02.194
1271	anonymous-f98557fd	4a2275a7-77a1-4c83-b7f1-a87ed34e26ae	2025-05-29 03:17:02.204
1272	anonymous-49272b05	26bc505b-e2bf-492a-af93-7462f3878353	2025-05-29 03:17:02.211
1273	anonymous-47d2b738	ae7f6782-dd0a-4d0b-94c9-43abc396d84b	2025-05-29 03:17:02.249
1274	anonymous-542563c1	21afd8df-346e-42a9-8614-eb27b0c0f6a1	2025-05-29 03:17:02.259
1275	anonymous-42449e0e	0032c1cf-5f8b-48eb-8041-9c7dc44ef9e0	2025-05-29 03:21:38.656
1276	anonymous-f3a1f49c	066b246c-4a60-49f6-8600-9ee7d8673fdd	2025-05-29 03:21:38.913
1277	anonymous-652d1d48	27283259-ea54-4a28-8bd3-315b78c4809c	2025-05-29 03:21:39.344
1278	anonymous-a2ae83e0	5882e856-ea19-436a-b303-f3f518be9283	2025-05-29 03:21:39.898
1279	anonymous-dbb5de64	d6684652-c1de-40ae-8c1e-38bbdf911893	2025-05-29 03:21:39.9
1280	anonymous-ae9e35ba	a4dd949c-8a6e-48d3-b350-55c454165f55	2025-05-29 03:21:39.876
1281	anonymous-f759786d	f726fb72-a79e-411d-a04d-585744ddc12f	2025-05-29 03:21:39.901
1282	anonymous-147ef25b	b721eebd-778c-4175-a6e6-1f636f5f4f0c	2025-05-29 03:21:40.015
1283	anonymous-faf99720	1a16f8b6-c2c2-42df-aa6e-4af3a726587d	2025-05-29 03:21:40.031
1284	anonymous-5a4d4370	8c4c33b9-2d46-4b40-89e5-5fa1068531c2	2025-05-29 03:21:40.04
1285	anonymous-80d6a2d2	f677e740-25c7-4497-8b8a-cf3e8b4b2259	2025-05-29 03:21:40.154
1286	anonymous-af0da2fe	c4dacba4-ad61-4912-9745-0fe11ddd7579	2025-05-29 03:21:40.157
1287	anonymous-4929ea54	cdcbbc6d-afae-49f3-8883-ca08daf8b3c6	2025-05-29 03:21:40.169
1288	anonymous-b4e6ca7c	7acbf968-50cf-40d7-88f1-e92c17d649a7	2025-05-29 03:21:40.205
1289	anonymous-7b74880f	9941bcad-7e26-4cde-b190-ce6c1e3dff9c	2025-05-29 03:21:40.258
1290	anonymous-e638acdb	a107fdc5-ab59-404f-9295-660047278e86	2025-05-29 03:21:40.258
1291	anonymous-3113b5db	c216932e-5325-4c44-9773-7b82909afa0f	2025-05-29 03:33:39.697
1292	anonymous-63c47fd8	c073c5bc-c603-45e9-b04f-bc298c4807b0	2025-05-29 03:33:40.012
1293	anonymous-85a19a4b	c5cc5507-e23e-4067-90ca-3ac1d845348a	2025-05-29 03:33:40.522
1294	anonymous-88a514c4	b0b50e98-058d-4c59-85f3-b5322ef4697d	2025-05-29 03:33:40.672
1295	anonymous-abce0b25	b2f1f687-ddcf-40dd-9333-b74c6b3fb8da	2025-05-29 03:33:41.7
1296	anonymous-f39b3fac	772b4584-466d-4e08-9cc1-423a08377648	2025-05-29 03:33:41.701
1297	anonymous-a08b615a	ce6fa17e-eb6a-4940-bec8-cefcae50223f	2025-05-29 03:33:40.684
1298	anonymous-a78ec1aa	f3b7160b-4489-4e75-901f-a45b4fe2dede	2025-05-29 03:33:40.77
1299	anonymous-3d1d1208	2a3369a0-f3c2-4153-8a43-b5ec4163637e	2025-05-29 03:33:41.778
1300	anonymous-b4089e0f	3d4436e2-b1f3-4721-afdd-16d5ca27c4ed	2025-05-29 03:33:41.785
1301	anonymous-8b6f61eb	2274c381-8ba0-40e8-adf2-75c14bd82dda	2025-05-29 03:33:41.817
1302	anonymous-131b4010	fe4b23cd-97ce-4b43-8c28-7587783895bd	2025-05-29 03:33:41.825
1303	anonymous-31b248e9	caed302a-e1b7-45c1-a1ab-03b23c408798	2025-05-29 03:33:41.825
1304	anonymous-71aa5514	f04a6459-c330-4851-929c-f18add0ad6ab	2025-05-29 03:33:41.865
1305	anonymous-d68527a5	1d3aed42-8ce9-4c64-b57b-59492abf73d7	2025-05-29 03:33:41.885
1306	anonymous-255e50a3	9d934852-6b09-47e4-bd5d-88661121d603	2025-05-29 03:33:41.901
1307	anonymous-427255ca	e95c9e54-cd42-4d1b-8084-147c675a91c6	2025-05-29 03:33:41.903
1308	anonymous-ee558aec	b200e9f9-5d4b-4bf8-8537-9ff3fe722411	2025-05-29 03:33:41.909
1309	anonymous-f78acb66	11ed2640-a7b2-4be9-8219-2a687a9a1e10	2025-05-29 03:33:41.932
1315	anonymous-2fad76c3	0e298275-bfe4-4536-8037-70274cfddc69	2025-05-29 03:33:42.008
1310	anonymous-f30acbb7	5e9df285-e35f-47de-a43d-0db6d42dd011	2025-05-29 03:33:41.932
1313	anonymous-324029e1	3e20009c-9286-4d4d-9ff7-b9e62f2af687	2025-05-29 03:33:41.972
1322	anonymous-cdeb4082	a8902b8a-1e83-4c43-b915-b6014f3f03b0	2025-05-29 03:33:42.078
1325	anonymous-0717c0ae	4e665eb4-09f1-47c8-879b-199ac672aea9	2025-05-29 03:33:42.12
1311	anonymous-364ed8e6	6a904600-3c43-4bea-a6c1-2ebb6e153114	2025-05-29 03:33:41.967
1329	anonymous-1d1a5358	776fd13f-ad7c-4d47-b568-a3d2cb755a7f	2025-05-29 03:33:42.265
1312	anonymous-aa7719fd	3947f053-becf-47c8-99b4-74a049f8b601	2025-05-29 03:33:41.973
1316	anonymous-ac33cd91	32e73cf9-5d6f-439a-9062-8371617dea94	2025-05-29 03:33:42.01
1318	anonymous-b5a04a39	e34bdbbc-7ee6-46bb-8e26-74626fbea743	2025-05-29 03:33:42.045
1326	anonymous-dd051406	e8138d97-45f5-4978-8ede-2dab434c6b71	2025-05-29 03:33:42.121
1314	anonymous-5cd702a4	a59cc1ff-5d7c-4799-a643-9417d28a98a9	2025-05-29 03:33:41.981
1317	anonymous-39b6a3e6	ecc775dd-17a7-46ff-acfa-4bd5ab5def17	2025-05-29 03:33:42.037
1320	anonymous-9aa2dfdf	1124e8d0-ed6d-4879-ba37-1c8210270461	2025-05-29 03:33:42.053
1321	anonymous-9f400e3a	2ceed0d4-4583-4ee9-b287-e549327ea1fe	2025-05-29 03:33:42.077
1323	anonymous-61b12e3c	debc4dc3-a635-4f6a-a401-b2ada9bf2a06	2025-05-29 03:33:42.106
1324	anonymous-f84449fb	05e4525e-fddb-4d6d-aea4-ae6517562ca0	2025-05-29 03:33:42.112
1327	anonymous-287b7b1e	39589476-a458-4ae4-8704-941d9625e329	2025-05-29 03:33:42.141
1328	anonymous-e980401e	f42a2868-87b7-4a53-8ed9-8357d5ceb629	2025-05-29 03:33:42.153
1319	anonymous-0746c87e	d70ff41a-decc-4e20-881a-52c5d039eaa0	2025-05-29 03:33:42.054
1330	anonymous-abe3bd45	f46a4fa7-dd31-4e70-bb07-371feea2ce97	2025-05-29 03:33:42.514
1331	anonymous-9e867182	26a3cc3f-fd18-45b5-ae61-7b714fcd2c00	2025-05-29 03:56:00.052
1332	anonymous-7977a195	326d87f7-a32c-4643-8acf-a2fa062b98bf	2025-05-29 03:56:02.166
1333	anonymous-06dd83bb	467b1492-4946-447b-9610-dfdc0a6b9893	2025-05-29 03:56:02.22
1334	anonymous-4ca179d4	284ac5ca-14b8-40c4-8117-8a5c8265cdb0	2025-05-29 03:56:03.237
1335	anonymous-c76b1783	5b3303f4-fc70-498b-8dcb-d22dbe231e01	2025-05-29 03:56:03.316
1336	anonymous-68445894	9ba423b5-22b7-42d2-b5b8-19c6c8998c49	2025-05-29 03:56:02.19
1337	anonymous-12b43ddd	570fe1fb-4db4-4065-8f90-2216cda0de6f	2025-05-29 03:56:03.455
1338	anonymous-83ac9f03	ab5fe606-52ab-44e3-a577-ed1db6505c70	2025-05-29 03:56:03.454
1339	anonymous-60d8ad80	05bc6a7d-db68-41b7-9eed-8b43f5bf4176	2025-05-29 03:56:03.533
1340	anonymous-a5a6ed9c	b2dd157b-03b9-4614-be66-ebdd071df883	2025-05-29 03:56:03.538
1341	anonymous-5ad169fc	831a674f-b5f3-4ba8-aed8-044e5cadb9b4	2025-05-29 03:56:03.611
1342	anonymous-4067f8d2	9db20588-0f3c-470a-a1f0-c876d00051af	2025-05-29 03:56:03.628
1343	anonymous-aa2b3204	cbcdfe52-123a-445b-ba1b-645ce98ec316	2025-05-29 03:56:03.611
1344	anonymous-b649950d	ee80e0c5-2791-46b8-9d64-a747d6b2e27f	2025-05-29 03:56:03.674
1345	anonymous-0da4632a	e77dbd49-ecca-4cff-83bf-f0a57f32676b	2025-05-29 03:56:03.616
1346	anonymous-84b4aaca	0b0b6eb9-ead5-4994-bc3c-47df9617af85	2025-05-29 03:56:03.677
1347	anonymous-e407617f	dff70842-bb7b-4ea4-aeb2-aedff881dc35	2025-05-29 03:56:03.754
1348	anonymous-7df0d532	e434974f-9930-4202-961a-b3517804e90a	2025-05-29 03:56:03.755
1349	anonymous-7d5091e0	b1061a61-b06a-452d-85f7-37dd7a3e0a0a	2025-05-29 03:56:03.753
1350	anonymous-705cbdd7	8801a74a-3b84-4d2c-aa91-f34349a496e9	2025-05-29 03:56:03.752
1351	anonymous-6f43abe6	72aa209e-4ef6-4bf1-9b2e-f18eb720e36f	2025-05-29 03:56:03.759
1352	anonymous-02c935c9	e2634d4b-ac43-4569-81b0-43c7f8d6fd4c	2025-05-29 03:56:03.758
1353	anonymous-8b2d4dd7	4b6985e5-cf96-4f76-a794-ae775e667d67	2025-05-29 03:56:03.827
1354	anonymous-8ae0b9d7	47ab284a-d384-42bd-a71e-e5bfb0063019	2025-05-29 03:56:03.827
1355	anonymous-b28369b5	4ca7c9bc-703a-4d38-bb4d-c9e6e21d7b81	2025-05-29 03:56:03.833
1356	anonymous-c1b8f106	d8fc1e3d-da47-47b9-943d-4e509194e060	2025-05-29 03:56:03.831
1357	anonymous-4c94b8f9	fbf05cd6-eed8-4a97-b806-f1c486530802	2025-05-29 03:56:03.846
1358	anonymous-16db6328	c78dca92-4d01-42a3-9f6c-376c82f772eb	2025-05-29 03:56:03.891
1359	anonymous-0fc9a369	4db014a6-d1d8-4c9d-9d4a-23e5f27e3b49	2025-05-29 03:56:03.897
1360	anonymous-c867db91	d99af16e-c4f6-4534-9c02-acfbfcf2ab3c	2025-05-29 03:56:03.899
1361	anonymous-b46a1d48	a4f25729-9a9f-4305-b705-9c26fff26265	2025-05-29 03:56:03.917
1362	anonymous-79c8aaa9	7e962e71-7538-4ef6-8b76-824fc92065f8	2025-05-29 03:56:03.917
1363	anonymous-b334180a	9a07e253-4bf1-4f44-85b9-6eeffb465831	2025-05-29 03:56:03.928
1364	anonymous-bd5df667	e0d8bdcd-8d82-4c50-bc42-806dba953d28	2025-05-29 03:56:03.969
1365	anonymous-fb9c3646	f165feed-52f4-48c8-9203-ddb819101ba8	2025-05-29 03:56:03.973
1366	anonymous-3730224b	7af4f2d8-e440-4c8a-b2d9-e27b56ffd33c	2025-05-29 03:56:03.977
1367	anonymous-f25d806a	b2f6b006-8e96-457f-a386-7dea932155c8	2025-05-29 03:56:03.998
1368	anonymous-75ee4bbc	642fec8d-10b0-49d6-943a-e0e3f92488e6	2025-05-29 03:56:03.999
1369	anonymous-2000ec3e	a92ed7e3-99c5-4fc1-89ba-12253c469052	2025-05-29 04:50:24.798
1370	anonymous-69a8b982	4f32d44e-bf26-4de7-86f5-cf50225fcdeb	2025-05-29 04:50:27.548
1371	anonymous-cb22667f	520be351-0488-4fe4-ad5d-b4f24c181939	2025-05-29 04:50:30.029
1372	anonymous-95c10833	b37ac753-cf2c-498c-bb75-4f8f6b38e211	2025-05-29 05:10:08.152
1373	anonymous-e45beac9	3aa98e6b-45c2-40dd-9c4e-8e9b181518e0	2025-05-29 07:01:05.252
1374	anonymous-17ee9eff	671f4ac4-98ed-4cac-8cef-db6a36de54df	2025-05-29 07:51:13.122
1375	anonymous-c8470f4e	fc29d0fb-fc10-481f-8669-e1f44d64cbd0	2025-05-29 12:45:48.03
1376	anonymous-ac0bd66b	cdcef749-abe4-4781-9876-aa2fe1bac68c	2025-05-29 12:45:52.783
1377	anonymous-8392b498	622965da-67b6-4c1e-85b2-32b8ed90ae8b	2025-05-29 13:03:12.535
1378	anonymous-8b9f0a0d	16bb77e9-68a2-4f74-9220-9e647a852a88	2025-05-29 13:03:13.864
1379	anonymous-2a09965f	fe32409a-688e-4fdc-b6b4-87a0ce17e2e4	2025-05-29 14:12:31.666
1380	anonymous-828632a4	9dd97058-ec6c-4c4b-9b06-f68e5c833477	2025-05-29 15:12:17.586
1381	anonymous-5070309c	c9038cda-fd90-4c5a-a2ab-6dfebd21b65f	2025-05-29 15:55:36.854
1382	anonymous-c828584d	f0bc3474-29f6-44e3-ac0d-a9380abf1471	2025-05-29 15:56:14.592
1383	anonymous-1d1cd44c	69078d08-5267-44fc-96e8-97351c424960	2025-05-29 17:02:01.388
1384	anonymous-2220ac82	13abc975-fd8c-475d-aa9a-9a96e6b9a8e0	2025-05-29 19:33:16.232
1385	anonymous-6dbaec36	b9a01b7d-d37b-4e40-9083-bd951e78da26	2025-05-29 22:55:35.18
1386	anonymous-592fae10	071e60c8-1e8f-4839-a376-082f2b39c9e3	2025-05-30 00:26:28.464
1387	anonymous-67032566	9d5e35b5-5592-43ef-b3bc-d49eb08ff8b7	2025-05-30 00:29:33.388
1388	anonymous-bad044cd	4286e1a0-7dc4-4f88-bd45-0ed38799f11a	2025-05-30 00:59:36.981
1389	anonymous-888e1fcf	48fd828c-e44f-4cdb-a82f-be6f89fe7aa9	2025-05-30 00:59:39.326
1390	anonymous-2a091c4d	8f01a892-45a6-4fb4-a9ce-66d540c58cd8	2025-05-30 06:06:21.769
1391	anonymous-e0755c0c	57ab0c98-d967-4173-bd4b-667d0ef19833	2025-05-30 09:16:45.593
1392	anonymous-fb7f4a7b	dd4a5f42-7969-42b2-ba10-3720a4412876	2025-05-30 11:15:59.826
1393	anonymous-156e4e8b	8e3cd267-5f2c-4782-befc-51155889021a	2025-05-30 14:14:43.322
1394	anonymous-ecd54df8	8bbd59ab-04f9-45fa-b6c0-cddb062b1839	2025-05-30 15:55:19.492
1395	anonymous-9ce06f1c	8def1d90-31ec-41ca-8e12-95aae20f185f	2025-05-30 17:14:43.247
1396	anonymous-676a84d2	e9b17a4b-746d-48ae-ae6f-69caae0a4635	2025-05-30 17:32:30.569
1397	anonymous-4d1f65ed	4b715d37-9240-440c-ae95-1ed315109dbb	2025-05-31 14:02:32.352
1398	anonymous-2a8363c3	09cc94b2-0e56-4ede-90eb-26dd78fb931a	2025-05-31 14:02:33.71
1399	anonymous-cfaf7b00	8680cf58-3fee-4c24-88a9-986bca319571	2025-05-31 19:50:43.908
1400	anonymous-7c4e1647	c127e105-da1a-4788-a585-5a84eadf032e	2025-06-01 04:27:27.044
1401	anonymous-f8b6c17a	5e4802a1-071a-4d3c-8680-594c87892655	2025-06-01 05:45:41.917
1402	anonymous-e58f826a	908cc8cf-841f-4cbb-b75a-2817d03cfa54	2025-06-01 08:07:26.705
1403	anonymous-2fe67120	871d508d-a3ab-40bb-beb7-4f26054798d1	2025-06-01 12:41:06.768
1404	anonymous-352c3ba6	7657ede2-025f-46b9-b4b4-41e3d10c1142	2025-06-01 16:12:34.038
1405	anonymous-a31b29db	9a7244d0-c817-4e0a-a1f8-108f64b914a6	2025-06-01 16:29:49.904
1406	anonymous-7c0447d6	6bb907bc-90e9-41b7-a2b6-7d3685adbe06	2025-06-01 16:53:58.92
1407	anonymous-e4dd22ea	870e16fd-81cb-498c-b09d-5d07defa9040	2025-06-01 18:49:32.574
1408	anonymous-39687cb7	fb61aa44-fd91-4fd9-b135-bb5dca0d487b	2025-06-02 12:43:52.663
1409	anonymous-83ae9beb	d567c9a4-c3c8-4dd5-95d1-1a1ed1095b4c	2025-06-02 19:57:06.6
1410	anonymous-f0a8a17a	d22174a1-6f81-415d-9105-b818190c1602	2025-06-02 20:37:18.57
1411	anonymous-b5461817	336d7a51-902f-44ca-af8c-e7cd2c6c2ec1	2025-06-03 02:35:13.106
1412	anonymous-f98acced	4ef967af-4f09-4b3e-bb02-8346cd17b368	2025-06-03 05:44:28.223
1413	anonymous-1c0a77f5	1c87d9d8-cdd0-483f-aa95-ab523162e437	2025-06-03 05:44:29.579
1414	anonymous-bedafb33	cfa6db04-7f30-4f57-b302-c9e0dbd7b61b	2025-06-03 05:44:29.846
1415	anonymous-7352c441	fd407f3e-32b3-4626-bdc7-8c1531534796	2025-06-03 05:58:00.791
1416	anonymous-dd3aac12	f7c05e2e-2a0a-4536-ac42-5db9d7823cb6	2025-06-03 06:05:19.313
1417	anonymous-023718e5	fa1793d1-8b99-49b4-9f30-12ec99373638	2025-06-03 07:24:15.073
1418	anonymous-c2250988	979eaccb-820e-43d0-9084-49a0cd5965d2	2025-06-03 10:22:37.245
1419	anonymous-666c968c	2ed618a8-eefa-4628-844f-7909e0e1ba4f	2025-06-03 13:40:35.875
1420	anonymous-573e67d5	14a57849-28f7-49ea-883e-3fdee2d684c2	2025-06-03 14:47:29.862
1421	anonymous-39bd8fbb	bc56145f-5bc5-4be6-8d11-04ddf5428562	2025-06-03 16:09:33.246
1422	anonymous-a19ae380	03b914b6-697c-4674-ad13-3d6236b41be1	2025-06-03 18:53:50.019
1423	anonymous-bc9a599f	302b66d3-d8f7-4225-833d-2b9c27702894	2025-06-03 18:54:18.178
1424	anonymous-d22eac04	46e35ec1-7e68-4244-b938-e991e943c29c	2025-06-03 19:28:01.9
1425	anonymous-98c410e2	c722891c-b273-4a6e-acc6-3abbd9d6cd3d	2025-06-03 20:06:18.642
1426	anonymous-9c5bca0b	c6a1c303-fb48-4f16-bd8e-a6a6df8e7332	2025-06-03 20:56:54.591
1427	anonymous-7b4b9c39	4d7daabf-ef1f-4629-9cb5-3683d6bc2d22	2025-06-03 21:31:32.206
1428	anonymous-f62dd678	39c63eb0-cb62-43fb-b84d-ef543cf5d976	2025-06-04 01:27:23.642
1429	anonymous-6922005c	182a52ca-2399-489d-b16a-e58691a3c124	2025-06-04 01:54:25.652
1430	anonymous-57bcf2c1	a5fd1986-2db9-40a6-9d2d-928aa6be5e35	2025-06-04 01:54:36.453
1431	anonymous-3b5d5815	511407ff-0815-4cc3-9222-05b12d7aefb3	2025-06-04 01:54:46.061
1432	anonymous-0e8c8c9e	1ac5f843-1ab5-4c77-88f8-2c21b7597c50	2025-06-04 01:54:54.448
1433	anonymous-8eefa055	35dd0542-3214-4ed9-905b-027ee430c0ab	2025-06-04 02:03:32.233
1434	anonymous-740357b6	c3cf4b60-68fb-4bf8-b839-fb6424d71259	2025-06-04 02:03:54.147
1435	anonymous-cff83245	043e331d-bde8-4c88-96d0-b051374a2f87	2025-06-04 02:03:56.435
1436	anonymous-529773d1	12951b28-5918-461d-aa4e-f1680a3eb91e	2025-06-04 02:03:58.697
1437	anonymous-18532c5b	c3dbdf2c-84ac-45e9-b69c-f30dd0239a82	2025-06-04 02:04:10.122
1438	anonymous-1122d0c6	220e2ae8-5a53-4d30-9976-173d717115e5	2025-06-04 05:11:35.274
1439	anonymous-ede8a7b3	8863033c-5577-47dd-a268-d9b240fd9d99	2025-06-04 07:17:45.05
1440	anonymous-a22914ee	0567148e-8131-486e-bf5d-66670a677b30	2025-06-04 08:26:06.511
1441	anonymous-4f725c6b	5b764578-1f53-476e-83a3-3bdcacaa2fc0	2025-06-04 08:26:11.089
1442	anonymous-698eda9e	f4ff5522-d08f-4ace-9e1a-6e6766772863	2025-06-04 08:26:38.429
1443	anonymous-b96187ca	3cd2e407-d517-4534-97b1-e9d3ae8b759f	2025-06-04 08:26:42.456
1444	anonymous-5fe558bf	effdac15-cbd5-4c0e-93d3-594f7914f06c	2025-06-04 08:26:46.089
1445	anonymous-78cdf0b8	a02df620-139c-43e1-94f0-5dc3a80ad037	2025-06-04 08:26:50.691
1446	anonymous-d5732bfe	e8afb631-5e1e-470c-9aab-4ceb2c661e7f	2025-06-04 08:26:53.377
1447	anonymous-02e7ba9d	035d8509-bc14-4532-b4a5-da43acbfd58e	2025-06-04 08:26:55.127
1448	anonymous-36ce3358	5893c84f-3191-4838-ab2a-516ed44bb170	2025-06-04 08:26:58.085
1449	anonymous-6b0dc0ed	ef94d63b-426a-4515-8cdd-4dbd807f373e	2025-06-04 08:27:01.267
1450	anonymous-a56ff60c	ac49fb0b-bc6e-4474-879b-aa277171f3a5	2025-06-04 08:27:05.065
1451	anonymous-a700aa92	522e8f9c-a824-4e5a-9c0c-e8bc4547785d	2025-06-04 08:27:09.913
1452	anonymous-24fa8b97	b52bb719-0916-485f-a855-97fe02366f70	2025-06-04 08:27:13.555
1453	anonymous-7f5ca721	8701db4b-3fdb-47d9-976c-3c7de6a5f87b	2025-06-04 08:27:15.408
1454	anonymous-4a3b30c7	198f2c51-72c7-43ef-a3b0-a9d5f258ffa2	2025-06-04 08:27:17.069
1455	anonymous-00c4ff61	c8694e0d-dcb2-4bb1-a7f0-939cecab4641	2025-06-04 08:27:21.414
1456	anonymous-b6fecbf3	20958739-6a1a-4923-a19a-1f9fde11d7e5	2025-06-04 08:27:28.501
1457	anonymous-971ac145	71020187-c392-4625-b5bf-1da9fb89c349	2025-06-04 08:27:36.69
1458	anonymous-65923d1b	acd80c07-36ff-4a7b-9b64-5b315d122a0d	2025-06-04 08:27:38.84
1459	anonymous-bce507e6	6fc38b3f-38ce-4baa-ba37-ae87bb5fe763	2025-06-04 08:27:42.714
1460	anonymous-c83ba248	26c37e4c-80be-41c5-80d9-9a5fefadaeb4	2025-06-04 08:27:47.583
1461	anonymous-884493a4	d0efec9f-caed-4a2c-9b9b-649faef301a1	2025-06-04 08:27:49.461
1462	anonymous-09b9e918	5957a177-6f76-4c1c-b714-5496fc35503e	2025-06-04 08:27:56.443
1463	anonymous-32747c24	211d0e23-612e-473f-be7a-e102f0fe8aa6	2025-06-04 08:27:58.596
1464	anonymous-8bf304de	5e5ea09f-5cdf-430c-b621-768caa11ba92	2025-06-04 08:28:14.116
1465	anonymous-5479b216	760e8ddd-eabe-4ceb-871c-d5ea7d768011	2025-06-04 08:28:19.496
1466	anonymous-89a895bc	a6d582a2-f6b2-4855-bddd-cb304ec42479	2025-06-04 08:28:20.643
1467	anonymous-e3ac0f4e	9e1c0065-474d-4299-aa43-627d95adfd66	2025-06-04 08:28:23.567
1468	anonymous-d9f88c41	743d5e08-4713-4a28-a23f-4e82594bbd96	2025-06-04 08:28:25.771
1469	anonymous-884354e0	011cf93b-abc3-4e63-9133-8e93d3c0fb7a	2025-06-04 08:28:29.634
1470	anonymous-dd5e79ef	34ef0523-f3bc-467f-81b2-fe5ce81173fb	2025-06-04 08:28:32.014
1471	anonymous-27f67a0b	39731b63-2e8e-43b2-81ce-e40f258fb89a	2025-06-04 08:28:33.371
1472	anonymous-61128ea3	155fc82a-e6d5-4d4a-8e17-7742acc88de2	2025-06-04 08:28:34.676
1473	anonymous-5bf47419	0a883fd1-a086-45ec-99c4-ed9b3f90a844	2025-06-04 08:28:42.625
1474	anonymous-ade9890b	56266ce2-1839-46cd-af6d-045bd815ddd0	2025-06-04 08:28:44.008
1475	anonymous-dbd5ba70	5fa883fb-cce0-4055-8cfb-44461dd67d4e	2025-06-04 08:28:47.249
1476	anonymous-fa256a18	3c101e58-482c-4a64-9025-66dcf9c92d88	2025-06-04 08:28:50.367
1477	anonymous-893da7d1	b0570df7-fafe-4a6d-bda9-0077be062064	2025-06-04 08:28:56.707
1478	anonymous-6737fe8d	29e955bb-57be-4d77-afa5-3a17a52861f0	2025-06-04 08:29:01.568
1479	anonymous-7d13c288	f11ff221-073e-4b8c-b4b7-db7dceb33e82	2025-06-04 08:29:03.21
1480	anonymous-b8e6b49f	89e466a5-9fdd-4e47-a592-3739c06430ca	2025-06-04 08:29:05.44
1481	anonymous-f8f03376	2e06970e-8890-4322-8c23-197bd7d8412d	2025-06-04 08:29:09.434
1482	anonymous-3298f122	d0c23ad8-44b2-47a6-ac9e-8f0804c920a1	2025-06-04 08:29:12.453
1483	anonymous-89716638	2a81c98a-2a79-4f29-ac88-7f0e96d208a0	2025-06-04 08:29:14.167
1484	anonymous-eb1faf3b	55c5a3f8-66e8-4a5a-8a43-6e0d80a0b225	2025-06-04 08:29:20.837
1485	anonymous-1dc9489f	4535b0f6-f1bf-483e-9ece-ca6b85b372f9	2025-06-04 08:29:24.344
1486	anonymous-24e60e81	30b0d677-3b83-43eb-bb99-0eed83d648be	2025-06-04 08:29:28.762
1487	anonymous-3b1caacf	5898981b-6e50-46be-8524-e8b6bfc52bd1	2025-06-04 08:29:31.153
1488	anonymous-68fa84c4	ac06adf9-9d57-43f2-ba8e-20070217bb4c	2025-06-04 08:29:36.224
1489	anonymous-f6288fd8	86e2afa0-3e67-49c5-bd07-a536ff65f8cf	2025-06-04 15:40:59.752
1490	anonymous-80aa056b	2e69196e-8ba9-4ded-9f27-0b473b81f4bc	2025-06-04 22:05:20.221
1491	anonymous-76a7bed3	ea09e3d1-a9c3-4450-b336-7193f5636146	2025-06-04 22:37:12.787
1492	anonymous-7e2a7f18	d7045ef5-d60f-40f6-bd4b-478e87a4ca00	2025-06-04 22:42:07.171
1493	anonymous-26700fec	436f996b-e250-44bc-a7ba-c1e20a408009	2025-06-05 00:35:05.002
1494	anonymous-78f4f091	38cfb79a-c9d0-40e8-9335-bc0398414543	2025-06-05 04:35:25.337
1495	anonymous-b2b25eea	9e4a365c-2778-4f16-9849-01fe42f3c071	2025-06-05 04:35:30.321
1496	anonymous-619f1545	deb4bde7-8f75-45c2-9325-20fde4397eb5	2025-06-05 04:35:33
1497	anonymous-ee66c542	4aebde9a-7651-42b8-8248-57328e49bce9	2025-06-05 08:08:48.767
1498	anonymous-b0d1fc91	8c16e347-c50c-4090-aad7-f9c95ec60942	2025-06-05 19:16:10.989
1499	anonymous-b96bf02a	99eee4cd-db77-42a5-ba64-e691dc627e4f	2025-06-05 21:25:43.459
1500	anonymous-1f20c37e	97d9c372-edf1-4a7f-a95e-189c240c1511	2025-06-05 21:51:35.002
1501	anonymous-f738dc50	dae2a8a7-6928-42c5-abb1-334259d4a269	2025-06-06 00:40:23.536
1502	anonymous-41e5795b	e5901b9c-cc3d-4d5e-b7fb-3d3e26978826	2025-06-06 07:26:36.585
1503	anonymous-3e895e1a	c275a80b-6f93-43d1-8a98-e16f076e8dff	2025-06-06 09:02:09.099
1504	anonymous-467a56ae	bcb23956-c04b-482a-aef2-085275d21da2	2025-06-06 16:03:19.671
1505	anonymous-18765a30	c0ccfd83-9e5d-40fe-aa10-7916700d82e8	2025-06-06 17:33:36.007
1506	anonymous-96cd0e67	747c6edb-3b4f-4cad-821c-57d8abe707f2	2025-06-06 18:35:05.583
1507	anonymous-b51fbae8	3e3fde3e-b4ba-45ce-97ef-f127588c7984	2025-06-06 19:14:58.701
1508	anonymous-550fef7a	30dabf8d-7590-4c68-b797-db5b4712a2be	2025-06-06 22:23:47.749
1509	anonymous-98d2c233	d4351b15-8b38-4ed3-a242-80878c8f5a00	2025-06-06 23:22:11.005
1510	anonymous-87b1cdf5	470c5b43-aaec-469a-ae97-7f8c610068c8	2025-06-07 09:41:22.971
1511	anonymous-23222502	f8189dd7-659b-4351-ac0e-e937365631da	2025-06-07 12:58:18.301
1512	anonymous-346b06de	685379ed-2002-4844-a04a-1d36c2898c61	2025-06-07 16:18:29.068
1513	anonymous-e86f1f6b	a6a9d2f3-c1a6-4c00-a3c8-6ab859da485d	2025-06-08 13:47:58.04
1514	anonymous-a6c95c6f	2310b24c-02fc-459c-83db-f3d98bc890d9	2025-06-08 13:47:59.21
1515	anonymous-4aa8fa2b	a38a350a-430f-43c4-9775-a82b7a85ebdf	2025-06-08 13:47:59.407
1516	anonymous-06787228	c41124c7-7f94-4094-be7f-efd707f6f078	2025-06-08 17:32:07.355
1517	anonymous-0954a182	46a8311a-f8fd-441c-b4b4-df74088b2369	2025-06-08 19:04:33.032
1518	anonymous-65c93ae8	b6de4adc-07c2-4f3b-bdfd-7143309bb628	2025-06-08 19:04:33.89
1519	anonymous-3079cc01	8194a0fc-30a8-4162-87cd-1f4b85e69f6e	2025-06-08 21:51:30.028
1520	anonymous-674084d3	2c846ce7-68b2-4be8-abdd-7d541fdc1c78	2025-06-08 23:23:40.182
1521	anonymous-76901160	0059610f-a693-4361-949b-c77fe47f2f6b	2025-06-09 00:16:48.954
1522	anonymous-26cad246	f1e2ca35-a2d2-4abd-a922-b5a497b0882c	2025-06-09 00:16:50.466
1523	anonymous-20b48bf9	7b7de4e3-9f8b-4b9a-8a81-b7f490862eca	2025-06-09 00:17:10.474
1524	anonymous-ad8b9b18	191430d5-ef13-4b0c-bcf7-c58cf7116b7c	2025-06-09 00:17:10.992
1525	anonymous-3d01ab46	12abfb8a-524a-42d2-ba7e-8153a8029275	2025-06-09 00:17:11.329
1526	anonymous-6d2794c3	2b879e07-de60-49cc-a153-d32e72304c28	2025-06-09 00:17:11.659
1527	anonymous-adad4bde	aa053c5b-cad8-4c5b-9d1a-c9b94fcaddd1	2025-06-09 00:17:11.95
1528	anonymous-22251410	58afc292-4a4b-4b35-9484-0de88e50ed37	2025-06-09 00:17:12.231
1529	anonymous-1f4b5f9b	087ef17e-64ad-44d4-83e8-25d6705c1bcf	2025-06-09 00:17:12.54
1530	anonymous-24032fca	a689b2a8-64ac-488c-a036-e8a7b20280f2	2025-06-09 00:17:12.896
1531	anonymous-df43aa5b	5059841a-88c0-4a03-86b0-be1b45a94d09	2025-06-09 00:17:13.226
1532	anonymous-5e3ec4b5	b646f8fa-bb05-4834-8988-a2f52c0586f5	2025-06-09 00:17:13.545
1533	anonymous-de513093	56293d7c-d600-406a-b68c-a3eb6b51b59d	2025-06-09 00:17:13.837
1534	anonymous-a1731236	3618cbe1-779c-425e-8fac-8de3390d4d82	2025-06-09 00:17:14.173
1535	anonymous-4f31d633	c79d80ca-4e80-45f3-914d-11d0cd6eb968	2025-06-09 00:17:14.501
1536	anonymous-05beac3b	597d17f2-adea-4382-9f2f-9bde88577d1b	2025-06-09 00:17:14.918
1537	anonymous-bd98f98d	6f3de407-a631-47d0-b779-f246d2004e08	2025-06-09 00:17:15.26
1538	anonymous-89e5575e	f09b4038-0315-4e9d-9f01-c8941e895840	2025-06-09 00:17:15.58
1539	anonymous-90867a25	e10b5734-9dae-4443-bb75-4187107c3335	2025-06-09 00:17:15.858
1540	anonymous-4655d56e	70423d56-a46d-4747-8f1b-0000a1bf211d	2025-06-09 00:17:16.416
1541	anonymous-cc6270ef	33838c28-6a3d-48cd-b26a-28d27004dafd	2025-06-09 00:17:16.785
1542	anonymous-96c84b59	5b160659-6040-46ac-829d-9b178dcd9d55	2025-06-09 00:17:17.278
1543	anonymous-977ba84c	da5f2adb-f645-4f38-be1f-6d78708448fa	2025-06-09 00:17:17.892
1544	anonymous-5f3c3e08	b1106cc1-0f2e-4cdf-aa96-228eac226b57	2025-06-09 00:17:18.263
1545	anonymous-c3838d10	d06cb4f1-d357-4641-b333-fb6cef0d8dd8	2025-06-09 00:17:18.818
1546	anonymous-b70a765e	8d03ae73-0b51-4894-83ad-d3741162ed20	2025-06-09 00:17:19.278
1547	anonymous-1796d218	d876248c-75d1-4a89-a01a-49e63e1946cf	2025-06-09 00:17:19.707
1548	anonymous-56ccd923	0590a97a-0e07-4be0-b320-612eb1599e32	2025-06-09 00:17:20.166
1549	anonymous-625cfe9c	968b5ca0-87dc-47c4-9844-3a35801124bd	2025-06-09 00:17:20.594
1550	anonymous-ce7c372b	3aed868e-79ce-45dd-bd24-64dee597c6ec	2025-06-09 00:17:21.051
1551	anonymous-b4aa95f2	617a2c4d-1710-4a1b-b249-90399763be30	2025-06-09 00:17:21.502
1552	anonymous-1f0c2144	7a152573-eaa4-41a1-92d3-e9c909727c18	2025-06-09 00:17:21.918
1553	anonymous-302d18c6	ef085c56-7480-486a-8038-76d678a6c7ef	2025-06-09 00:17:22.353
1554	anonymous-abe7074b	eaaa13f1-d611-4305-b8c7-6d83cbe25df6	2025-06-09 00:17:22.773
1555	anonymous-2fc69c91	1b97f05c-90cd-472a-b0ca-c0827d6fb45a	2025-06-09 00:17:23.172
1556	anonymous-48f2d8a9	765d90a0-53a6-4e04-8fad-68a282a425e3	2025-06-09 00:17:23.564
1557	anonymous-5c2b7301	a99c0bc7-7277-4310-acef-d265a3748f14	2025-06-09 02:52:57.847
1558	anonymous-64d854a9	a6aa5af3-88ac-450a-82aa-56082a4bdb8a	2025-06-09 15:00:54.09
1559	anonymous-3b99e88a	8bed9ada-7f5a-4945-bed7-de6e79f296c2	2025-06-09 18:28:38.595
1560	anonymous-a14fda23	38608aed-b66d-4ebb-ae81-f7b89e991acc	2025-06-09 18:51:01.526
1561	anonymous-10186170	19ebdcf7-1b7c-4bce-9600-3fc1285a3555	2025-06-09 19:04:03.614
1562	anonymous-c4d633e9	81f8f7cd-e954-429f-9133-44f82c7980ee	2025-06-09 21:11:16.127
1563	anonymous-096d3dbf	f70b981a-785c-47b8-b2e9-5074dedcad7e	2025-06-09 21:11:36.983
1564	anonymous-e52b6dd3	67232745-bc93-4cc4-97ba-8a4f1f5971a4	2025-06-09 23:52:51.438
1565	anonymous-2ad9bf18	9996bf64-9317-4020-8a6a-543e484545c6	2025-06-10 08:23:14.89
1566	anonymous-10aedccc	a5be2754-8e06-4e49-98ff-9ce19ad38f59	2025-06-10 17:26:34.027
1567	anonymous-b4364399	e5bdcce4-cae5-4029-b652-d5a80cd639ed	2025-06-10 21:04:11.309
1568	anonymous-bdfe44f5	811ed1ca-7520-4ba4-9206-15105320a1d5	2025-06-10 23:42:49.415
1569	anonymous-404c9bbc	65fab6b9-a0d8-4c37-80d9-c79f5e6b5ddf	2025-06-11 20:27:21.55
1570	anonymous-91b6e967	c826233d-39d7-4a69-8c77-89fa6387fe29	2025-06-11 20:33:58.322
1571	anonymous-144260c9	b673ddeb-4ce7-4a09-b751-f2d55c5f1849	2025-06-11 21:18:49.247
1572	anonymous-0f882694	95a48ce8-3d73-4d20-bfad-d637bb208ed8	2025-06-11 22:04:40.531
1573	anonymous-85296393	9793260f-19a8-4523-ab9c-1f0a38f7ae1a	2025-06-11 22:04:40.814
1574	anonymous-970ab6ed	c68a90e3-ef44-45b5-b8d2-3c6db4bc23a1	2025-06-11 22:04:40.925
1575	anonymous-c0f474ea	54c01145-5b59-4273-bad8-76158e2717da	2025-06-11 23:59:14.101
1576	anonymous-8027e684	95fb80ce-7c00-4071-bb66-c2ad4f0db5a9	2025-06-11 23:59:15.138
1577	anonymous-dc8941ec	bcfd695c-a948-45f2-880d-338c50066a00	2025-06-12 00:05:46.895
1578	anonymous-81855010	3c343904-e628-432a-8a37-308352fb71ee	2025-06-12 00:24:06.934
1579	anonymous-d18e1978	8281c224-bd3e-4afe-a3dc-b94735502329	2025-06-12 04:16:22.931
1580	anonymous-0c22b5e8	d16a155d-7981-4096-8b24-21902f8df7ec	2025-06-12 11:36:27.595
1581	anonymous-dada52f9	0a199ecc-9403-4f39-babc-114892369ce4	2025-06-12 11:56:12.505
1582	anonymous-28d44eeb	9f84b455-31a7-40f5-92ef-5894cbed4f05	2025-06-12 11:57:15.071
1583	anonymous-cdf9bf64	579216c7-bc1d-49a6-a3bd-527bf44f6cc5	2025-06-12 12:30:58.176
1584	anonymous-4be2bd27	a286a9bb-278e-4ef1-b9df-dc920e936751	2025-06-12 12:52:53.272
1585	anonymous-b3a4110a	2cbcc166-2f98-44d8-a28b-a90b7acfa966	2025-06-12 14:07:51.238
1586	anonymous-9c951117	c049cfc3-b785-42f4-86be-5987a566acc2	2025-06-12 14:32:43.855
1587	anonymous-b119fd55	dc0e20eb-666f-4dfd-b793-80be56a58406	2025-06-12 15:29:40.791
1588	anonymous-15c95afe	de55761c-ea14-4c6d-8883-1f314dc4a3a5	2025-06-12 15:42:51.496
1589	anonymous-8c2086f2	8ad85d07-f45b-40ac-bf05-db3afb09f366	2025-06-12 18:45:08.736
1590	anonymous-bb5db05d	bf3b7d82-a316-487e-b340-2f9bfcd9af2e	2025-06-12 20:23:50.357
1591	anonymous-63cdbe55	72039a76-f00d-44eb-a629-994ea0bc7f10	2025-06-12 21:47:31.885
1592	anonymous-04bef128	dac2adb7-a64f-4b9f-ac7e-5c8ce539ef81	2025-06-12 22:02:39.245
1593	anonymous-b2f79c7a	35689df1-0ac6-4e4f-8ea4-646c3181ff21	2025-06-12 22:02:39.248
1594	anonymous-6889da0a	4e50c1f6-4063-4687-ad14-a3c371c72c70	2025-06-12 22:02:39.284
1595	anonymous-63366415	9d8a97ee-a88e-4fb3-8ea6-58da59c1b6c8	2025-06-12 22:02:39.775
1596	anonymous-d54d5049	866f84d9-27d3-4bbc-b3f1-9738951ec06b	2025-06-12 22:02:40.057
1597	anonymous-52e4e02b	628012f2-ca04-4684-90c8-e8443c2f6c3a	2025-06-12 22:05:41.966
1598	anonymous-2ec045b2	aa327bfc-a9e2-4ff7-a32e-d95ccb96b1be	2025-06-12 22:05:41.96
1599	anonymous-bb1196d3	dd8fb024-6841-44af-bee1-9ab8c54ffc41	2025-06-12 22:45:42.874
1600	anonymous-734965b7	ae219270-3532-4479-9801-28800d118b5c	2025-06-12 22:45:43.869
1601	anonymous-fd38b836	2db0abe0-1982-46fc-bd2e-ad4ce029d6f4	2025-06-13 00:52:35.269
1602	anonymous-dbfa46e1	99220e1d-6c9a-425b-a99a-38a534fdf633	2025-06-13 02:39:53.316
1603	anonymous-5c6de724	51f43866-ab00-4df7-a6bc-505bed47bcd6	2025-06-13 02:39:54.687
1604	anonymous-955a3c78	a1915460-63c7-4915-bc0b-d66257724f87	2025-06-13 03:17:11.962
1605	anonymous-13f498c2	6c750545-c913-41be-ab25-03d71211343e	2025-06-13 05:12:06.463
1606	anonymous-79db2e55	87e94911-4890-4229-a130-724ee2ed56ca	2025-06-13 05:12:46.257
1607	anonymous-62f8d691	88b23a97-51b3-4137-b9e6-c1bd5ca13749	2025-06-13 05:20:02.445
1608	anonymous-fc4245bb	94260c10-8f87-441d-818f-e4125cd9b35c	2025-06-13 05:20:15.438
1609	anonymous-d406d0ae	6ed53ff2-e40c-4335-9d86-9c24f69e8ebd	2025-06-13 06:12:05
1610	anonymous-20b39169	2975aa59-726c-4af9-8821-c7704ffac033	2025-06-13 06:13:27.384
1611	anonymous-9801abdd	8af01859-7b85-4d5d-8733-0ed924e57403	2025-06-13 06:24:55.9
1612	anonymous-8d7b73e8	90e4a538-6867-47ed-9349-767cc5583741	2025-06-13 09:49:59.867
1613	anonymous-82eac148	16c024eb-4f5f-406d-9156-37699cb73c1f	2025-06-13 11:27:58.811
1614	anonymous-cc88989c	5686de19-5fcc-4d99-8b50-616f913a349b	2025-06-13 13:35:34.392
1615	anonymous-1dfe1082	d71e32e3-3943-476d-9489-c870c00b346a	2025-06-13 15:01:19.963
1616	anonymous-2e2c31bc	e76a1f74-26b9-47df-a8c9-407a30669043	2025-06-13 16:04:05.661
1617	anonymous-07165034	028a28bd-f357-416e-8395-06250850cd54	2025-06-13 17:25:59.15
1618	anonymous-4a178537	e381b6e0-7000-4564-87ce-e3b98cae0a51	2025-06-13 17:37:12.648
\.


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.conversations_id_seq', 125, true);


--
-- Name: feedbacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.feedbacks_id_seq', 33, true);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sessions_id_seq', 1613, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 1618, true);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_session_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_session_id_key UNIQUE (session_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: conversations conversations_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(session_id) ON DELETE CASCADE;


--
-- Name: feedbacks feedbacks_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(session_id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

