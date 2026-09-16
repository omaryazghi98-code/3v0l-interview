window.INTERVIEW_QUESTIONS = [
  {
    id:'Q-009', category:'Introduction', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Why are you looking for a new opportunity?', variants:['What are you looking for in your next role?','Pourquoi cherchez-vous une nouvelle opportunité ?','Que recherchez-vous pour votre prochain poste ?'],
    intent:'Motivation and stability',
    answer_fr:"Je recherche surtout une opportunité stable sur le long terme, dans laquelle je peux utiliser mon expérience en support client et technique. J'aime les environnements internationaux, les cas complexes et les postes où je peux continuer à apprendre.",
    answer_en:"I'm mainly looking for a stable, long-term opportunity where I can use my customer and technical support experience. I enjoy international environments, complex cases, and roles where I can keep learning.",
    story_ids:[], verified_facts:['6+ years support experience'], tags:['motivation','stability','next role'], risk_flags:['Do not criticize previous employers.']
  },
  {
    id:'Q-010', category:'Introduction', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Why customer support?', variants:['What do you like about support?','Pourquoi le support client ?','Qu’est-ce qui vous plaît dans le support ?'],
    intent:'Role motivation',
    answer_fr:"Ce qui me plaît, c'est le côté concret du support : comprendre le problème, isoler la cause et aider le client avec une réponse claire. Avec l'expérience, j'ai aussi apprécié les cas complexes et le fait d'aider les collègues quand une procédure n'est pas suffisante.",
    answer_en:"What I like about support is the practical problem-solving side: understand the issue, isolate the cause, and give the customer a clear next step. Over time, I've also enjoyed complex cases and helping colleagues when a standard procedure isn't enough.",
    story_ids:['ST-01','ST-04'], verified_facts:['Complex case resolution','Agent support'], tags:['motivation','support','problem solving'], risk_flags:[]
  },
  {
    id:'Q-011', category:'Introduction', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Why do you want a remote role?', variants:['Why remote work?','Pourquoi travailler à distance ?'],
    intent:'Remote fit',
    answer_fr:"J'ai déjà travaillé dans des environnements internationaux et à distance, donc je connais les exigences d'autonomie, de communication et d'organisation. Je suis à l'aise avec les outils collaboratifs et je préfère un environnement où la responsabilité individuelle est claire.",
    answer_en:"I've already worked in international and remote environments, so I'm familiar with the need for autonomy, communication and organization. I'm comfortable with collaboration tools and I work well when individual responsibility is clear.",
    story_ids:[], verified_facts:['Remote support experience'], tags:['remote','autonomy','organization'], risk_flags:['Do not promise perfect availability beyond the agreed schedule.']
  },
  {
    id:'Q-012', category:'Motivation', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Why this role?', variants:['Why are you interested in this position?','Pourquoi ce poste vous intéresse-t-il ?'],
    intent:'Role alignment',
    answer_fr:"Le poste correspond bien à mon expérience parce qu'il combine support, résolution de problèmes et communication avec des clients. Je peux apporter mon expérience des cas complexes, des escalades et des environnements à volume élevé, tout en apprenant rapidement le produit spécifique.",
    answer_en:"The role matches my background because it combines support, problem-solving and customer communication. I can bring experience with complex cases, escalations and high-volume environments while learning the specific product quickly.",
    story_ids:['ST-01','ST-03','ST-04'], verified_facts:['Technical support','Gaming support','High-volume chat'], tags:['why role','fit'], risk_flags:[]
  },
  {
    id:'Q-013', category:'Career', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Why did you have several shorter roles?', variants:['Why so many job changes?','Pourquoi plusieurs expériences relativement courtes ?'],
    intent:'Career continuity',
    answer_fr:"Une partie de mon parcours s'est faite sur des projets ou des environnements avec des périmètres différents. Malgré les changements d'employeur, la fonction centrale est restée cohérente : support, dépannage, gestion de cas complexes et escalades. Aujourd'hui, je cherche surtout à construire cette expérience dans un environnement plus stable sur le long terme.",
    answer_en:"Part of my career was built around project-based roles and different operational scopes. Even when the employer changed, the core work stayed consistent: support, troubleshooting, complex cases and escalations. I'm now looking to build that experience in a more stable long-term environment.",
    story_ids:[], verified_facts:['Project-based/varied support roles'], tags:['career','short tenure','stability'], risk_flags:['Do not use this explanation to rewrite the reason for the ModSquad ending.']
  },
  {
    id:'Q-014', category:'Career / Accountability', language:'mixed', company:'ModSquad', source_type:'verified_candidate',
    question:'What happened at the end of your ModSquad employment?', variants:['Why did ModSquad end your employment?','Que s’est-il passé à la fin de votre expérience chez ModSquad ?'],
    intent:'Accountability',
    answer_fr:"Ma dernière période chez ModSquad s'est terminée à la suite de problèmes d'assiduité pendant une période où je déménageais et travaillais de nuit. J'en assume la responsabilité. Depuis, j'ai stabilisé mon environnement et mon organisation de travail, et je suis prêt à m'engager de manière fiable sur le long terme.",
    answer_en:"My final period at ModSquad ended following attendance issues during a period when I was moving while working night shifts. I take responsibility for that. Since then, I've stabilized my living and work setup and I'm ready to commit reliably to a long-term role.",
    story_ids:[], verified_facts:['ModSquad March 2022–January 2024','Final period ended after attendance issues'], tags:['modsquad','termination','attendance','accountability'], risk_flags:['Never call this a layoff, budget cut or project closure.','Do not blame management.','Keep concise.']
  },
  {
    id:'Q-015', category:'Career / Accountability', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How can we trust your attendance will be reliable?', variants:['Why should we believe the same issue will not happen again?','Comment être sûrs que votre assiduité sera fiable ?'],
    intent:'Reliability reassurance',
    answer_fr:"Parce que la situation qui avait créé le problème a été stabilisée et que je suis beaucoup plus strict sur l'organisation de mon travail et de mon planning. Je préfère aussi être très clair sur mes contraintes de disponibilité avant de commencer, afin de pouvoir tenir mes engagements.",
    answer_en:"The situation that caused the problem has been stabilized, and I'm much stricter about how I organize my work and schedule. I also prefer to be very clear about availability expectations before starting so I can reliably meet them.",
    story_ids:[], verified_facts:['Current focus on stable work setup'], tags:['reliability','attendance','accountability'], risk_flags:[]
  },
  {
    id:'Q-016', category:'Career Gap', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'What have you been doing since your last role?', variants:['How have you spent your time since January 2024?','Que faites-vous depuis votre dernier poste ?'],
    intent:'Career gap',
    answer_fr:"J'ai consacré cette période à ma recherche d'une opportunité stable et adaptée à mon expérience. En parallèle, j'ai continué à développer mes compétences techniques, à travailler sur des projets personnels et à maintenir une routine de travail structurée.",
    answer_en:"I've spent this period looking for a stable opportunity that matches my experience. In parallel, I've continued developing my technical skills, working on personal projects, and maintaining a structured work routine.",
    story_ids:[], verified_facts:['Ongoing job search','Technical development'], tags:['gap','unemployment','development'], risk_flags:['Do not invent employers, freelance work or certifications not in the verified record.']
  },
  {
    id:'Q-017', category:'Career Gap', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Why did it take you so long to find another job?', variants:['Why haven’t you worked since your last position?','Pourquoi avez-vous mis autant de temps à retrouver un poste ?'],
    intent:'Gap explanation',
    answer_fr:"Le marché des postes à distance est compétitif et j'ai voulu cibler des opportunités qui correspondent réellement à mon expérience. Je n'ai pas arrêté de me développer pour autant : j'ai continué à travailler sur mes compétences, mes outils et des projets techniques personnels.",
    answer_en:"The remote market is competitive, and I've been targeting opportunities that genuinely match my experience. I haven't stopped developing either; I've continued working on my skills, tools and personal technical projects.",
    story_ids:[], verified_facts:['Job search','Technical development'], tags:['gap','market','selectivity'], risk_flags:['Do not overstate selectivity if the question is clearly about availability.']
  },
  {
    id:'Q-018', category:'Career', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Were your earlier roles temporary or project-based?', variants:['Were these contracts tied to projects?','Certaines de vos expériences étaient-elles liées à des projets ?'],
    intent:'Tenure context',
    answer_fr:"Oui, plusieurs expériences étaient liées à des projets ou à des périmètres spécifiques. C'est aussi une des raisons pour lesquelles les intitulés et les périodes varient. Ce qui reste constant, c'est mon expérience opérationnelle en support, dépannage et gestion des escalades.",
    answer_en:"Yes. Several roles were tied to specific projects or operational scopes, which is one reason the titles and periods vary. The consistent part is the operational support work: troubleshooting, complex cases and escalation handling.",
    story_ids:[], verified_facts:['5CA and Airalo project-based context in source materials'], tags:['contracts','career','project'], risk_flags:['Do not use project-based framing to explain the ModSquad attendance ending.']
  },
  {
    id:'Q-019', category:'Behavioral', language:'mixed', company:'General', source_type:'candidate_story',
    question:'Tell me about a time you showed initiative.', variants:['Give me an example of being proactive.','Parlez-moi d’une fois où vous avez pris une initiative.'],
    intent:'Initiative',
    answer_fr:"Chez Airalo, j'ai remarqué que certains cas complexes ou non résolus n'avaient pas de circuit assez clair pour demander de l'aide. J'ai contribué à structurer un workflow "ask for help" pour transmettre les dossiers avec le contexte nécessaire aux agents seniors. Cela a rendu l'escalade plus organisée.",
    answer_en:"At Airalo, I noticed that some complex or unresolved cases did not have a clear route for getting help. I helped structure an 'ask for help' workflow so cases reached senior agents with the necessary context. It made escalation more organized.",
    story_ids:['ST-01'], verified_facts:['Airalo Ask for Help workflow'], tags:['initiative','airalo','process'], risk_flags:['Do not claim quantified savings unless verified.']
  },
  {
    id:'Q-020', category:'Behavioral', language:'mixed', company:'General', source_type:'candidate_story',
    question:'Tell me about a time you helped a colleague.', variants:['When did you go above and beyond for a teammate?','Parlez-moi d’une fois où vous avez aidé un collègue.'],
    intent:'Teamwork',
    answer_fr:"Chez Comdata, je maîtrisais une procédure Iris assez spécialisée. Je suis devenu un point de référence pour ces dossiers et j'ai accompagné environ quatre à cinq nouveaux collègues de manière pratique sur la procédure. Cela leur permettait de gagner en autonomie plus rapidement.",
    answer_en:"At Comdata, I became very familiar with a specialized Iris process and became a point of reference for it. I provided hands-on guidance to around four or five new colleagues. It helped them become comfortable with the process faster.",
    story_ids:['ST-02'], verified_facts:['Guided roughly 4–5 new colleagues','ENGIE Iris'], tags:['teamwork','training','comdata'], risk_flags:['Do not call yourself a formal trainer.']
  },
  {
    id:'Q-021', category:'Behavioral', language:'mixed', company:'General', source_type:'candidate_story',
    question:'Tell me about a time you dealt with pressure.', variants:['How do you perform under high volume?','Comment gérez-vous la pression ?'],
    intent:'Pressure management',
    answer_fr:"Chez Spotify, je pouvais gérer environ quatre à sept conversations de chat en parallèle. Je devais prioriser selon l'urgence, garder des notes claires et éviter de perdre le contexte d'un échange à l'autre. Cette expérience m'a appris à rester structuré même quand le volume augmente.",
    answer_en:"At Spotify, I handled around four to seven concurrent live chats. I prioritized by urgency, kept clear notes, and made sure I didn't lose context between conversations. That taught me to stay structured even when volume increases.",
    story_ids:['ST-03'], verified_facts:['Spotify 4–7 concurrent chats'], tags:['pressure','spotify','multitask'], risk_flags:['Do not invent a percentage for productivity or CSAT.']
  },
  {
    id:'Q-022', category:'Behavioral', language:'mixed', company:'General', source_type:'candidate_story',
    question:'Tell me about a mistake or failure.', variants:['What is a professional mistake you made?','Parlez-moi d’une erreur que vous avez commise.'],
    intent:'Self-awareness',
    answer_fr:"Au début de ma carrière, j'avais tendance à vouloir aller trop loin dans la résolution d'un problème avant de faire une escalade. Avec l'expérience, j'ai compris que l'escalade fait partie d'une bonne résolution lorsqu'un problème dépasse mes accès ou mon niveau d'autorité. Aujourd'hui, je sais mieux reconnaître ce moment.",
    answer_en:"Earlier in my career, I sometimes spent too long trying to solve a problem myself before escalating. I learned that escalation is part of good resolution when an issue is outside my access or authority. Today I'm much better at recognizing that point sooner.",
    story_ids:[], verified_facts:['Escalation judgment framework'], tags:['failure','learning','escalation'], risk_flags:['Do not invent a specific 45-minute incident unless independently verified.']
  },
  {
    id:'Q-023', category:'Behavioral', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Tell me about a time you received difficult feedback.', variants:['How do you handle criticism?','Comment réagissez-vous à un feedback difficile ?'],
    intent:'Coachability',
    answer_fr:"J'essaie d'abord de séparer le ton du contenu et d'identifier ce qui peut réellement m'aider à progresser. Si le feedback est précis, je cherche à comprendre ce qui doit changer puis je mets en place une manière concrète de le corriger. Je préfère considérer le feedback comme une donnée utile plutôt que comme une attaque personnelle.",
    answer_en:"I first separate the tone from the useful content and identify what can actually help me improve. When feedback is specific, I make sure I understand what needs to change and then apply a concrete adjustment. I prefer to treat feedback as useful information rather than as a personal attack.",
    story_ids:[], verified_facts:['Accountability and improvement principles in interview materials'], tags:['feedback','coachability'], risk_flags:['Do not invent a named manager or specific feedback event.']
  },
  {
    id:'Q-024', category:'Behavioral', language:'mixed', company:'General', source_type:'candidate_story',
    question:'Tell me about a time you had conflicting priorities.', variants:['How do you prioritize competing tasks?','Parlez-moi d’une situation où vous aviez plusieurs priorités.'],
    intent:'Prioritization',
    answer_fr:"Je commence par regarder l'impact et l'urgence, puis je vérifie les contraintes de procédure ou de délai. Dans un environnement de chat à fort volume comme Spotify, je gardais le contexte de chaque conversation et je traitais en priorité les situations qui avaient le plus d'impact immédiat.",
    answer_en:"I start by looking at impact and urgency, then I check any process or deadline constraints. In a high-volume chat environment like Spotify, I kept the context of each conversation and prioritized situations with the highest immediate impact.",
    story_ids:['ST-03'], verified_facts:['Spotify high-volume live chat'], tags:['prioritization','spotify','volume'], risk_flags:[]
  },
  {
    id:'Q-025', category:'Behavioral', language:'mixed', company:'General', source_type:'candidate_story',
    question:'Tell me about a time you solved something without clear documentation.', variants:['What do you do when the knowledge base is incomplete?','Parlez-moi d’un problème sans documentation claire.'],
    intent:'Resourcefulness',
    answer_fr:"Je commence par réunir les symptômes exacts et vérifier les ressources disponibles. Si la documentation ne couvre pas le cas, je cherche des précédents ou une solution sûre. Ensuite, si le problème dépasse mes accès ou reste ambigu, je documente ce que j'ai déjà vérifié et je fais une escalade exploitable.",
    answer_en:"I start by collecting the exact symptoms and checking the available resources. If the documentation doesn't cover the case, I look for similar precedents or a safe workaround. If it still exceeds my access or remains ambiguous, I document what I've checked and escalate with useful context.",
    story_ids:['ST-01'], verified_facts:['Airalo unresolved-case workflow'], tags:['unknown','documentation','escalation'], risk_flags:['Do not claim a workaround was approved unless it actually was.']
  },
  {
    id:'Q-026', category:'Technical', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Walk me through your troubleshooting process.', variants:['How do you diagnose technical issues?','Expliquez-moi votre méthode de dépannage.'],
    intent:'Diagnostic method',
    answer_fr:"Je commence par clarifier le symptôme et le contexte, puis je cherche à reproduire ou isoler le problème. Je vérifie la documentation et les informations du compte ou de l'appareil disponibles, je teste les étapes de dépannage appropriées, puis je confirme le résultat. Si le cas dépasse mes accès, je l'escalade avec tout le contexte déjà vérifié.",
    answer_en:"I start by clarifying the symptom and context, then I try to reproduce or isolate the issue. I check documentation and the available account or device information, test the appropriate troubleshooting steps, and confirm the result. If the case is outside my access, I escalate with all the relevant context already verified.",
    story_ids:['ST-01','ST-04'], verified_facts:['Technical troubleshooting','Escalation handling'], tags:['troubleshooting','diagnostics'], risk_flags:['Do not claim system permissions you did not have.']
  },
  {
    id:'Q-027', category:'Technical', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you know when to escalate?', variants:['When should Tier 1 stop troubleshooting?','Quand faut-il faire une escalade ?'],
    intent:'Escalation judgment',
    answer_fr:"Je fais une escalade lorsque le problème dépasse mes accès, mon niveau d'autorité ou la procédure documentée, ou lorsqu'une autre équipe possède les outils nécessaires. Je joins le problème exact, les vérifications déjà effectuées et le contexte utile afin d'éviter de refaire le même diagnostic.",
    answer_en:"I escalate when the issue is outside my access, authority or documented process, or when another team has the right tools. I include the exact problem, the troubleshooting already completed and the useful context so the next team doesn't have to start from zero.",
    story_ids:['ST-01','ST-04'], verified_facts:['Escalation judgment'], tags:['escalation','tiering','technical'], risk_flags:[]
  },
  {
    id:'Q-028', category:'Technical', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you avoid guessing?', variants:['What do you do when you do not know the answer?','Que faites-vous lorsque vous ne connaissez pas la réponse ?'],
    intent:'Accuracy',
    answer_fr:"Je préfère dire clairement que je dois vérifier plutôt que d'inventer une réponse. Je consulte la documentation ou les ressources internes disponibles, et si nécessaire je demande de l'aide ou je fais une escalade. Pour moi, une réponse exacte un peu plus tard vaut mieux qu'une réponse rapide mais incorrecte.",
    answer_en:"I prefer to say that I need to verify rather than guess. I check the available documentation or internal resources, and if necessary I ask for help or escalate. An accurate answer a little later is better than a fast but incorrect answer.",
    story_ids:['ST-01'], verified_facts:['Knowledge-base and escalation workflow'], tags:['accuracy','unknown','integrity'], risk_flags:[]
  },
  {
    id:'Q-029', category:'Technical', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you document an escalation?', variants:['What should a good escalation contain?','Que doit contenir une bonne escalade ?'],
    intent:'Documentation',
    answer_fr:"Je résume le problème, le contexte nécessaire, les étapes que j'ai déjà vérifiées et le résultat de ces vérifications. J'ajoute les identifiants ou informations autorisés qui permettent à l'équipe suivante de reprendre le dossier sans refaire toutes les étapes.",
    answer_en:"I summarize the issue, the necessary context, what I already checked and the results of those checks. I include the permitted identifiers or details that let the next team continue without repeating the entire investigation.",
    story_ids:['ST-01','ST-04'], verified_facts:['Escalation workflow','Complex case support'], tags:['documentation','escalation'], risk_flags:[]
  },
  {
    id:'Q-030', category:'Technical', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How would you handle a recurring technical issue?', variants:['What do you do when the same problem keeps happening?','Que faites-vous lorsqu’un problème revient régulièrement ?'],
    intent:'Root cause and process thinking',
    answer_fr:"Je regarde si les cas ont un même symptôme ou une même cause probable, puis je documente le pattern. Si le problème revient et que le processus peut être amélioré, je propose une manière plus claire de traiter ou d'escalader les cas. C'est notamment l'approche que j'ai eue chez Airalo.",
    answer_en:"I look for a shared symptom or likely root cause across cases and document the pattern. If the issue keeps recurring and the process can be improved, I propose a clearer way to handle or escalate it. That's the kind of approach I used at Airalo.",
    story_ids:['ST-01'], verified_facts:['Airalo recurring-issue review','Ask for Help workflow'], tags:['recurring issue','root cause','process'], risk_flags:[]
  },
  {
    id:'Q-031', category:'Technical / Support', language:'mixed', company:'General', source_type:'candidate_story',
    question:'How do you balance speed and quality?', variants:['How do you balance AHT and CSAT?','Comment équilibrez-vous rapidité et qualité ?'],
    intent:'Operational judgment',
    answer_fr:"Pour moi, aller vite ne veut pas dire répondre trop vite. Je cherche d'abord à comprendre le problème et à le résoudre correctement du premier coup. Une réponse rapide mais incomplète peut créer un nouveau contact ou une escalade, donc je préfère une réponse efficace et précise.",
    answer_en:"For me, being fast doesn't mean answering too quickly. I focus on understanding the issue and resolving it correctly the first time. A fast but incomplete answer can create another contact or escalation, so I aim for efficient and accurate resolution.",
    story_ids:['ST-03'], verified_facts:['High-volume chat experience'], tags:['AHT','CSAT','quality','speed'], risk_flags:['Do not cite unsupported benchmark percentages.']
  },
  {
    id:'Q-032', category:'Technical', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you handle a customer who cannot describe the technical problem clearly?', variants:['What if the customer is vague?','Que faites-vous si le client n’explique pas clairement le problème ?'],
    intent:'Discovery questions',
    answer_fr:"Je simplifie les questions et je demande les informations une par une : qu'est-ce qui se passe, depuis quand, sur quel appareil ou quelle plateforme, et qu'est-ce qui a changé juste avant le problème ? Ensuite, je reformule ce que j'ai compris avant de commencer le dépannage.",
    answer_en:"I simplify the questions and gather information one point at a time: what happens, since when, on which device or platform, and what changed just before the issue. Then I restate what I understood before starting troubleshooting.",
    story_ids:['ST-01','ST-04'], verified_facts:['Technical support','Account support'], tags:['discovery','probing','technical'], risk_flags:[]
  },
  {
    id:'Q-033', category:'Technical', language:'mixed', company:'General', source_type:'scenario_roleplay',
    question:'A customer says the service is completely broken. What do you do first?', variants:['The issue sounds urgent and broad. What is your first step?','Le client dit que tout est bloqué. Que faites-vous en premier ?'],
    intent:'Incident triage',
    answer_fr:"Je commence par vérifier si le problème est individuel ou généralisé. Je demande le symptôme précis, puis je vérifie les informations ou les ressources disponibles pour déterminer s'il existe un incident connu. Je ne promets pas de délai tant que le statut réel n'est pas confirmé.",
    answer_en:"I first determine whether the problem is individual or part of a wider incident. I clarify the exact symptom and check the available status information for a known incident. I don't promise a resolution time until the actual status is confirmed.",
    story_ids:[], verified_facts:[], tags:['incident','outage','triage'], risk_flags:['Do not claim access to a status page unless the role provides one.']
  },
  {
    id:'Q-034', category:'Gaming', language:'mixed', company:'TransPerfect', source_type:'candidate_story',
    question:'Why do you want to work in gaming support?', variants:['What interests you about gaming support?','Pourquoi le support gaming ?'],
    intent:'Gaming motivation',
    answer_fr:"J'ai déjà une expérience directe du support gaming avec Epic Games, donc je connais les problématiques liées aux comptes, aux achats et aux joueurs frustrés. Je suis aussi moi-même joueur, ce qui m'aide à comprendre le contexte, mais je garde toujours une approche professionnelle et fondée sur les faits.",
    answer_en:"I already have direct gaming support experience with Epic Games, so I understand account, purchase and frustrated-player issues. I'm also a gamer myself, which helps me understand the context, but I always keep a professional, fact-based approach.",
    story_ids:['ST-04'], verified_facts:['Epic Games gaming support','Gamer identity'], tags:['gaming','motivation','transperfect'], risk_flags:['Do not claim to know every game or system.']
  },
  {
    id:'Q-035', category:'Gaming', language:'mixed', company:'TransPerfect', source_type:'candidate_story',
    question:'A player says their purchase is missing. How do you investigate?', variants:['How would you handle a missing V-Bucks purchase?','Un joueur ne voit pas son achat, que faites-vous ?'],
    intent:'Gaming account investigation',
    answer_fr:"Je commence par vérifier les détails de l'achat, le compte concerné et la plateforme utilisée. Je veux comprendre exactement où l'achat a été effectué avant de conclure qu'il s'agit d'un problème système. Ensuite, je prends uniquement les actions autorisées par la procédure du projet.",
    answer_en:"I start by verifying the purchase details, the account involved and the platform used. I want to understand exactly where the purchase was made before assuming there is a system failure. Then I take only the actions allowed by the project process.",
    story_ids:['ST-04'], verified_facts:['Epic Games account/transaction support'], tags:['gaming','purchase','vbucks','account'], risk_flags:['Do not promise a refund or credit before verification.']
  },
  {
    id:'Q-036', category:'Gaming', language:'mixed', company:'TransPerfect', source_type:'scenario_roleplay',
    question:'A player is abusive and demands an immediate ban reversal.', variants:['How do you handle a toxic ban appeal?','Un joueur vous insulte et exige la levée immédiate de son bannissement.'],
    intent:'Moderation and de-escalation',
    answer_fr:"Je ne réponds pas à l'agressivité par l'agressivité. Je reconnais la frustration, puis je me concentre sur les faits : raison de la sanction, compte concerné et procédure d'appel. Je n'annule pas une mesure simplement pour calmer le joueur ; je suis la politique applicable.",
    answer_en:"I don't respond to aggression with aggression. I acknowledge the frustration and then focus on the facts: the reason for the action, the account involved and the appeal process. I don't reverse a decision just to calm the player; I follow the applicable policy.",
    story_ids:['ST-04'], verified_facts:['EA/The Sims Discord moderation','Epic Games support'], tags:['gaming','toxicity','ban','moderation'], risk_flags:['Do not invent moderation policy details.']
  },
  {
    id:'Q-037', category:'Gaming', language:'mixed', company:'TransPerfect', source_type:'candidate_story',
    question:'How do you support a player who is emotional but has a legitimate technical problem?', variants:['How do you separate emotion from the issue?','Comment gérez-vous un joueur très émotif mais qui a un vrai problème ?'],
    intent:'Empathy plus diagnosis',
    answer_fr:"Je reconnais d'abord sa frustration sans prendre les mots personnellement. Ensuite, j'isole le problème concret : qu'est-ce qui ne fonctionne pas, sur quel compte et quelle plateforme, et depuis quand. Une fois les faits établis, je peux expliquer clairement la prochaine étape.",
    answer_en:"I first acknowledge the frustration without taking the words personally. Then I isolate the concrete issue: what is failing, on which account and platform, and since when. Once the facts are clear, I can explain the next step clearly.",
    story_ids:['ST-04'], verified_facts:['Gaming support','De-escalation approach'], tags:['gaming','empathy','diagnosis'], risk_flags:[]
  },
  {
    id:'Q-038', category:'Gaming', language:'mixed', company:'TransPerfect', source_type:'scenario_roleplay',
    question:'What if the player threatens to post on social media?', variants:['What if they threaten bad publicity?','Que faites-vous si le joueur menace de publier une mauvaise critique ?'],
    intent:'Policy boundaries',
    answer_fr:"Je ne me laisse pas guider par la menace. Je traite le dossier selon les faits et la politique applicable. Je peux reconnaître leur frustration et expliquer ce que je peux faire, mais je ne promets pas une exception pour éviter une publication négative.",
    answer_en:"I don't let the threat drive my decision. I handle the case according to the facts and the applicable policy. I can acknowledge the frustration and explain what I can do, but I won't promise an exception just to avoid a negative post.",
    story_ids:['ST-04'], verified_facts:['Policy adherence','Epic Games support'], tags:['gaming','social media','policy'], risk_flags:['Never offer an exception solely to avoid bad publicity.']
  },
  {
    id:'Q-039', category:'Gaming', language:'mixed', company:'TransPerfect', source_type:'candidate_story',
    question:'How quickly can you learn a new game or product?', variants:['Can you support a game you do not know?','À quelle vitesse apprenez-vous un nouveau jeu ?'],
    intent:'Learning agility',
    answer_fr:"Je commence par apprendre le produit à travers la documentation, les parcours utilisateur et les problèmes les plus fréquents. Mon expérience Epic Games m'a déjà appris à comprendre rapidement un écosystème de jeu et les catégories de problèmes. Ensuite, je construis progressivement mes repères à partir des cas réels.",
    answer_en:"I start by learning the product through documentation, user journeys and the most common issue types. My Epic Games experience taught me how to quickly understand a gaming ecosystem and common support categories. Then I build my knowledge progressively from real cases.",
    story_ids:['ST-04'], verified_facts:['Epic Games support experience'], tags:['learning','gaming','adaptability'], risk_flags:['Do not claim expertise in a title you have not supported.']
  },
  {
    id:'Q-040', category:'Gaming', language:'mixed', company:'TransPerfect', source_type:'candidate_story',
    question:'How does your moderation experience help in player support?', variants:['Does community moderation change how you support players?','En quoi votre expérience de modération vous aide-t-elle ?'],
    intent:'Cross-skill transfer',
    answer_fr:"La modération m'a appris à rester neutre, à suivre des règles de communauté et à ne pas réagir émotionnellement lorsqu'une personne est agressive. En support, ces compétences sont utiles pour séparer le comportement de la personne du problème que je dois réellement résoudre.",
    answer_en:"Moderation taught me to stay neutral, follow community rules, and not react emotionally when someone is aggressive. In support, those skills help me separate the person's behavior from the actual issue I need to solve.",
    story_ids:[], verified_facts:['EA/The Sims Discord moderation'], tags:['moderation','gaming','professionalism'], risk_flags:[]
  },
  {
    id:'Q-041', category:'Fintech', language:'mixed', company:'TapTap Send', source_type:'researched_role',
    question:'Why do you want to work in fintech/remittances?', variants:['What interests you about money-transfer support?','Pourquoi le support fintech / transfert d’argent ?'],
    intent:'Fintech motivation',
    answer_fr:"Ce qui m'intéresse, c'est l'impact concret du service et le niveau de précision nécessaire. Quand un client a un problème avec un transfert, il faut être empathique mais aussi très rigoureux sur la vérification et la communication. C'est un environnement qui correspond bien à mon expérience des cas complexes et des procédures.",
    answer_en:"What interests me is the real-world impact of the service and the level of precision required. When someone has a transfer problem, you need empathy but also strong verification and clear communication. That fits my experience with complex cases and structured procedures.",
    story_ids:['ST-01','ST-02'], verified_facts:['Support experience','Complex cases','Process adherence'], tags:['taptap','fintech','motivation'], risk_flags:['Do not claim prior fintech expertise you do not have.']
  },
  {
    id:'Q-042', category:'Fintech', language:'mixed', company:'TapTap Send', source_type:'researched_role',
    question:'A transfer is pending. How do you respond?', variants:['What if the customer says the transfer should be instant?','Un transfert est en attente, que faites-vous ?'],
    intent:'Payment support triage',
    answer_fr:"Je commence par vérifier le statut exact du transfert et la raison du délai. Ensuite, j'explique ce que le système montre réellement et les prochaines étapes disponibles. Je ne promets pas un délai que je ne peux pas confirmer ; je donne uniquement l'information vérifiée pour le type de transfert et le canal concernés.",
    answer_en:"I first check the exact transfer status and the reason for the delay. Then I explain what the system actually shows and the available next steps. I don't promise a timeline I cannot confirm; I give only the verified information for the transfer type and channel involved.",
    story_ids:[], verified_facts:[], tags:['taptap','transfer','pending','customer support'], risk_flags:['Company policy is external role knowledge; verify current rules.']
  },
  {
    id:'Q-043', category:'Fintech', language:'mixed', company:'TapTap Send', source_type:'researched_role',
    question:'A customer is angry because a failed transfer has not returned yet.', variants:['How would you handle a refund delay after a failed transfer?','Un client attend toujours le retour des fonds après un échec.'],
    intent:'Refund communication',
    answer_fr:"Je reconnais l'inquiétude, puis je vérifie le statut et le moyen de paiement. J'explique le délai correspondant aux informations officielles du service, sans le présenter comme une promesse personnelle. Si le délai annoncé est dépassé, je suis la procédure prévue pour le suivi.",
    answer_en:"I acknowledge the concern, then verify the transfer status and payment method. I explain the timeframe shown by the official process without turning it into a personal promise. If the expected timeframe has passed, I follow the designated escalation or follow-up process.",
    story_ids:[], verified_facts:[], tags:['taptap','refund','payment method','empathy'], risk_flags:['Current refund timelines must be checked against official TapTap Send guidance.']
  },
  {
    id:'Q-044', category:'Fintech', language:'mixed', company:'TapTap Send', source_type:'researched_role',
    question:'What would you do if a KYC check delays a transfer?', variants:['How do you explain compliance checks to an angry customer?','Comment expliquer un contrôle KYC à un client frustré ?'],
    intent:'Compliance communication',
    answer_fr:"Je vérifie d'abord le statut réel du dossier. Si une vérification KYC est nécessaire, j'explique pourquoi des contrôles supplémentaires peuvent être requis et quelles informations sont demandées, sans promettre de contourner le contrôle. L'objectif est d'être transparent, précis et rassurant sans minimiser la situation.",
    answer_en:"I first verify the actual status. If a KYC check is required, I explain why additional verification may be needed and what information is required, without suggesting that the check can be bypassed. The goal is to be transparent, precise and reassuring without minimizing the situation.",
    story_ids:[], verified_facts:[], tags:['taptap','KYC','compliance'], risk_flags:['Do not provide legal advice or invent compliance rules.']
  },
  {
    id:'Q-045', category:'Fintech', language:'mixed', company:'TapTap Send', source_type:'researched_role',
    question:'A customer says, “You stole my money.” What do you say?', variants:['How do you handle an accusation involving missing funds?','Un client dit : « Vous avez volé mon argent ».'],
    intent:'High-stakes de-escalation',
    answer_fr:"Je ne prends pas l'accusation personnellement. Je reconnais le stress lié à l'argent, puis je vérifie le statut du transfert et j'explique précisément ce que le système indique. Je reste factuel et je donne la prochaine étape disponible, sans faire de promesse que je ne peux pas garantir.",
    answer_en:"I don't take the accusation personally. I acknowledge the stress involved when money is at stake, then verify the transfer status and explain exactly what the system shows. I stay factual and give the available next step without making a promise I can't guarantee.",
    story_ids:['ST-04','ST-01'], verified_facts:['De-escalation','Verification before action'], tags:['taptap','angry customer','money'], risk_flags:[]
  },
  {
    id:'Q-046', category:'Fintech', language:'mixed', company:'TapTap Send', source_type:'researched_role',
    question:'What does good customer service look like in fintech?', variants:['How is fintech support different?','À quoi ressemble un bon support client en fintech ?'],
    intent:'Industry judgment',
    answer_fr:"Pour moi, il faut combiner empathie, précision et respect strict des procédures. Le client peut être très stressé, mais cela ne change pas la nécessité de vérifier l'identité, le statut de la transaction et les règles applicables. Une bonne expérience, c'est donner une information claire sans inventer ce qu'on ne sait pas.",
    answer_en:"It requires empathy, precision and strict process adherence. A customer can be very stressed, but that doesn't remove the need to verify identity, transaction status and applicable rules. Good service means clear information without inventing what you don't know.",
    story_ids:['ST-01','ST-02'], verified_facts:['Process adherence','Complex support'], tags:['fintech','customer experience','compliance'], risk_flags:[]
  },
  {
    id:'Q-047', category:'Fintech', language:'mixed', company:'TapTap Send', source_type:'researched_role',
    question:'Which TapTap Send value resonates with your experience?', variants:['How do you connect with our values?','Quelle valeur de TapTap Send vous correspond le plus ?'],
    intent:'Values alignment',
    answer_fr:"La valeur "Accept reality, propose solutions" correspond bien à ma manière de travailler. Chez Airalo, par exemple, j'ai identifié un problème récurrent dans le circuit d'aide et j'ai contribué à structurer une solution concrète. Je préfère généralement partir du problème réel et chercher ce qui est faisable.",
    answer_en:"'Accept reality, propose solutions' fits the way I work. At Airalo, for example, I noticed a recurring issue in the help process and helped structure a practical solution. I generally prefer to start from the real constraint and focus on what can actually be changed.",
    story_ids:['ST-01'], verified_facts:['Airalo workflow improvement'], tags:['taptap','values','airalo'], risk_flags:['Use only the values currently published by TapTap Send.']
  },
  {
    id:'Q-048', category:'Remote Work', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you stay productive while working remotely?', variants:['How do you structure your day at home?','Comment restez-vous productif en télétravail ?'],
    intent:'Remote discipline',
    answer_fr:"Je travaille avec une organisation assez structurée : planning clair, espace de travail dédié et vérification de mon équipement avant de commencer. Comme j'ai déjà travaillé à distance, je sais aussi qu'il faut communiquer rapidement lorsqu'un blocage apparaît au lieu d'attendre.",
    answer_en:"I work with a structured routine: clear schedule, dedicated workspace and equipment checks before starting. Since I've already worked remotely, I also know that when a blocker appears, it's better to communicate early instead of waiting.",
    story_ids:[], verified_facts:['Remote work experience','Dedicated home setup'], tags:['remote','productivity','discipline'], risk_flags:[]
  },
  {
    id:'Q-049', category:'Remote Work', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'What do you do when you get blocked while working remotely?', variants:['How do you handle blockers without a manager nearby?','Que faites-vous lorsqu’un blocage apparaît en télétravail ?'],
    intent:'Proactivity',
    answer_fr:"Je commence par vérifier la documentation et les ressources disponibles et j'essaie d'isoler le problème. Si je reste bloqué, je contacte la bonne personne avec un résumé clair du problème, ce que j'ai déjà essayé et ce dont j'ai besoin pour avancer.",
    answer_en:"I first check the documentation and available resources and try to isolate the issue. If I'm still blocked, I contact the right person with a clear summary of the problem, what I've already tried and what I need to move forward.",
    story_ids:['ST-01'], verified_facts:['Escalation and blocker communication'], tags:['remote','blocker','communication'], risk_flags:[]
  },
  {
    id:'Q-050', category:'Remote Work', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you communicate when you need help?', variants:['How do you escalate internally while remote?','Comment demandez-vous de l’aide à distance ?'],
    intent:'Async communication',
    answer_fr:"J'essaie de rendre la demande exploitable dès le premier message : contexte, problème précis, vérifications déjà faites et question ou action attendue. Cela évite les échanges inutiles et permet à la personne qui m'aide de comprendre rapidement le dossier.",
    answer_en:"I make the request useful from the first message: context, exact problem, checks already completed and the question or action needed. That reduces unnecessary back-and-forth and lets the person helping me understand the case quickly.",
    story_ids:['ST-01','ST-04'], verified_facts:['Escalation workflow','Complex support'], tags:['remote','async','communication','escalation'], risk_flags:[]
  },
  {
    id:'Q-051', category:'Remote Work', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you prepare your setup before a shift?', variants:['How do you make sure your equipment is ready?','Comment préparez-vous votre environnement avant votre shift ?'],
    intent:'Operational reliability',
    answer_fr:"Je vérifie ma connexion, mes appareils, le casque ou microphone et les outils nécessaires avant le début du shift. Je préfère détecter un problème avant de commencer plutôt qu'une fois que je suis déjà en interaction avec un client.",
    answer_en:"I check my connection, devices, headset or microphone and the tools I need before the shift starts. I'd rather catch an issue before work begins than discover it while I'm already handling a customer.",
    story_ids:[], verified_facts:['Remote work setup discipline'], tags:['remote','setup','reliability'], risk_flags:[]
  },
  {
    id:'Q-052', category:'Recruiter', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'What are your salary expectations?', variants:['What compensation are you looking for?','Quelles sont vos prétentions salariales ?'],
    intent:'Compensation alignment',
    answer_fr:"Je suis ouvert à discuter du budget prévu pour le poste. Ce qui compte pour moi, c'est aussi l'ensemble du rôle : responsabilités, horaires, stabilité et conditions de travail. Si vous me partagez la fourchette prévue, je peux vous dire immédiatement si elle correspond à mes attentes.",
    answer_en:"I'm open to discussing the budget you have for the role. I also look at the full picture: responsibilities, schedule, stability and working conditions. If you can share the range for the position, I can tell you whether it aligns with my expectations.",
    story_ids:[], verified_facts:[], tags:['salary','recruiter'], risk_flags:['Do not claim a compensation history that is not verified.']
  },
  {
    id:'Q-053', category:'Recruiter', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Are you available for weekends, nights or holidays?', variants:['Are you comfortable with 24/7 schedules?','Êtes-vous disponible le soir, le week-end ou les jours fériés ?'],
    intent:'Schedule fit',
    answer_fr:"J'ai déjà travaillé dans des environnements internationaux avec des horaires variables, donc je suis à l'aise avec les contraintes de shift. L'important pour moi est d'avoir un planning et des attentes claires afin de pouvoir être fiable sur les horaires convenus.",
    answer_en:"I've already worked in international environments with variable schedules, so I'm comfortable with shift-based work. What's important to me is having clear scheduling expectations so I can be reliable on the agreed hours.",
    story_ids:[], verified_facts:['International/shift support experience'], tags:['schedule','shifts','availability'], risk_flags:[]
  },
  {
    id:'Q-054', category:'Recruiter', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'When could you start?', variants:['What is your notice period?','Quand pourriez-vous commencer ?'],
    intent:'Availability',
    answer_fr:"Je peux m'adapter au calendrier du processus et à la date de démarrage prévue par l'entreprise. Je préfère simplement confirmer les contraintes exactes avant de m'engager sur une date précise.",
    answer_en:"I can work around the company's hiring timeline and target start date. I just prefer to confirm the exact constraints before committing to a specific date.",
    story_ids:[], verified_facts:[], tags:['availability','start date'], risk_flags:['Replace with the actual availability date when known.']
  },
  {
    id:'Q-055', category:'Recruiter', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Are you interviewing elsewhere?', variants:['Are you in other processes?','Êtes-vous actuellement en discussion avec d’autres entreprises ?'],
    intent:'Recruiter logistics',
    answer_fr:"Je regarde plusieurs opportunités qui correspondent à mon expérience, surtout dans le support client et technique. Mon objectif n'est pas simplement d'accepter le premier poste disponible, mais de trouver une collaboration stable et sérieuse.",
    answer_en:"I'm exploring several opportunities that match my customer and technical support background. My goal isn't simply to take the first available role; it's to find a stable and serious long-term fit.",
    story_ids:[], verified_facts:[], tags:['recruiter','process'], risk_flags:[]
  },
  {
    id:'Q-056', category:'Recruiter', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'What type of manager do you work best with?', variants:['What management style suits you?','Avec quel type de manager travaillez-vous le mieux ?'],
    intent:'Manager fit',
    answer_fr:"J'apprécie un manager qui donne des attentes claires, du feedback direct et laisse aussi une certaine autonomie pour résoudre les problèmes. Je n'ai pas besoin d'être constamment supervisé, mais j'apprécie de savoir où je peux poser une question ou faire remonter un risque.",
    answer_en:"I work well with managers who set clear expectations, give direct feedback and allow autonomy to solve problems. I don't need constant supervision, but I value knowing where to go when I need help or need to raise a risk.",
    story_ids:[], verified_facts:['Remote and escalation experience'], tags:['manager','autonomy','feedback'], risk_flags:[]
  },
  {
    id:'Q-057', category:'Recruiter', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'What are your greatest strengths?', variants:['What do you do especially well?','Quelles sont vos principales qualités ?'],
    intent:'Strengths',
    answer_fr:"Mes principaux points forts sont le dépannage, la communication et la gestion de cas complexes. Je suis aussi assez proactif lorsqu'un problème récurrent apparaît, et je suis à l'aise pour aider un collègue ou organiser une escalade avec le bon contexte.",
    answer_en:"My main strengths are troubleshooting, communication and handling complex cases. I'm also proactive when I notice a recurring issue, and I'm comfortable helping teammates or preparing a useful escalation with the right context.",
    story_ids:['ST-01','ST-02','ST-04'], verified_facts:['Troubleshooting','Complex case resolution','Agent support'], tags:['strengths','troubleshooting'], risk_flags:[]
  },
  {
    id:'Q-058', category:'Recruiter', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'What is your biggest weakness?', variants:['What would you like to improve?','Quelle est votre principale faiblesse ?'],
    intent:'Self-awareness',
    answer_fr:"J'ai parfois tendance à vouloir vérifier plusieurs fois une information avant de répondre, surtout sur les cas complexes. Avec l'expérience, j'ai appris à mieux équilibrer la précision avec le rythme de traitement, en distinguant les sujets qui nécessitent une vraie investigation de ceux qui peuvent être traités rapidement.",
    answer_en:"I sometimes tend to verify information more than once before answering, especially on complex cases. With experience, I've learned to balance precision with pace by distinguishing issues that truly need deeper investigation from those that can be resolved quickly.",
    story_ids:[], verified_facts:['Known weakness framing in source materials'], tags:['weakness','self-awareness'], risk_flags:['Do not use a fake weakness unrelated to the job.']
  },
  {
    id:'Q-059', category:'Recruiter', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Why should we hire you?', variants:['What would you bring to the team?','Pourquoi devrions-nous vous recruter ?'],
    intent:'Value proposition',
    answer_fr:"J'apporte une combinaison d'expérience support client et technique, avec du gaming, du chat à fort volume, du téléphone et des cas complexes. Je suis à l'aise avec les procédures, les outils et les escalades, et je peux travailler aussi bien en français qu'en anglais dans un environnement international.",
    answer_en:"I bring a combination of customer and technical support experience across gaming, high-volume chat, phone work and complex cases. I'm comfortable with processes, tools and escalations, and I can operate in both French and English in an international environment.",
    story_ids:['ST-03','ST-04','ST-02'], verified_facts:['6+ years','French/English','Multichannel support'], tags:['hire','value proposition'], risk_flags:['Avoid comparing yourself negatively with other candidates.']
  },
  {
    id:'Q-060', category:'Recruiter', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Where do you want to grow next?', variants:['What are your career goals?','Comment souhaitez-vous évoluer ?'],
    intent:'Growth',
    answer_fr:"Je veux continuer à renforcer mon expertise en support technique et opérations, tout en développant davantage la partie process et coordination. Mon expérience chez Airalo m'a montré que j'aime aussi améliorer les workflows, pas seulement traiter les tickets.",
    answer_en:"I want to keep strengthening my technical support and operations expertise while developing further in process improvement and coordination. My experience at Airalo showed me that I also enjoy improving workflows, not just handling tickets.",
    story_ids:['ST-01'], verified_facts:['Airalo APM exposure','Workflow improvement'], tags:['career growth','operations'], risk_flags:['Do not claim formal management aspirations unless relevant to the role.']
  },
  {
    id:'Q-061', category:'Recruiter', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Why did you move between support channels?', variants:['Why phone, chat and back office?','Pourquoi avoir travaillé sur plusieurs canaux ?'],
    intent:'Adaptability',
    answer_fr:"Les différents projets m'ont exposé à plusieurs canaux et cela m'a appris à adapter ma communication au contexte. Le téléphone demande une résolution rapide à l'oral, le chat exige une bonne organisation entre plusieurs conversations, et le back-office demande beaucoup de précision dans le traitement des données et des workflows.",
    answer_en:"Different projects exposed me to multiple channels, and that taught me to adapt communication to the context. Phone support requires fast verbal resolution, chat requires strong organization across conversations, and back-office work requires accuracy with data and workflows.",
    story_ids:['ST-02','ST-03'], verified_facts:['Phone','Chat','Back-office'], tags:['channels','adaptability'], risk_flags:['Do not attribute phone work to Spotify.']
  },
  {
    id:'Q-062', category:'Hiring Manager', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you handle a large backlog?', variants:['What if ticket volume suddenly increases?','Comment gérez-vous un gros backlog ?'],
    intent:'Volume management',
    answer_fr:"Je commence par identifier les critères de priorité : urgence, impact client et contraintes de délai. Ensuite je garde une vue claire des dossiers en cours et j'évite de traiter tous les tickets exactement de la même manière. En cas de pic important, je communique rapidement si un arbitrage ou une aide d'équipe est nécessaire.",
    answer_en:"I start by identifying priority criteria such as urgency, customer impact and deadlines. Then I keep a clear view of active cases and avoid treating every ticket exactly the same way. During a major spike, I communicate early if team-level prioritization or help is needed.",
    story_ids:['ST-03'], verified_facts:['High-volume Spotify chat'], tags:['backlog','volume','prioritization'], risk_flags:[]
  },
  {
    id:'Q-063', category:'Hiring Manager', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you keep context when handling multiple conversations?', variants:['How did you manage 4–7 chats at once?','Comment gardez-vous le contexte sur plusieurs chats ?'],
    intent:'Multitasking',
    answer_fr:"Je note les éléments importants dans chaque conversation et je garde une structure claire pour savoir ce qui est en attente, ce qui a déjà été vérifié et quelle est la prochaine étape. Chez Spotify, avec plusieurs conversations en parallèle, cette discipline était essentielle pour ne pas mélanger les dossiers.",
    answer_en:"I keep clear notes for each conversation and track what is pending, what I've verified and what the next step is. At Spotify, with several conversations running in parallel, that discipline was essential to avoid mixing cases.",
    story_ids:['ST-03'], verified_facts:['Spotify 4–7 concurrent chats'], tags:['multitask','chat','spotify'], risk_flags:[]
  },
  {
    id:'Q-064', category:'Hiring Manager', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you decide what deserves more investigation?', variants:['When do you dig deeper?','Comment décidez-vous qu’un cas mérite une analyse approfondie ?'],
    intent:'Judgment',
    answer_fr:"Je regarde d'abord l'impact, les informations déjà disponibles et la possibilité d'une résolution avec les procédures existantes. Si le cas est inhabituel, répété, à fort impact ou hors procédure, je prends plus de temps pour l'analyser ou je fais une escalade plutôt que de poursuivre indéfiniment seul.",
    answer_en:"I look first at impact, the information already available and whether the existing process can resolve it. If a case is unusual, recurring, high-impact or outside procedure, I investigate further or escalate rather than spending unlimited time on it alone.",
    story_ids:['ST-01'], verified_facts:['Escalation judgment','Recurring issue review'], tags:['judgment','investigation','escalation'], risk_flags:[]
  },
  {
    id:'Q-065', category:'Hiring Manager', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you make an escalation useful to Tier 2?', variants:['How do you avoid back-and-forth after escalation?','Comment rendre une escalade utile à l’équipe suivante ?'],
    intent:'Cross-team efficiency',
    answer_fr:"Je donne un résumé du problème, les symptômes, les vérifications effectuées, les résultats et la question précise qui nécessite l'aide de l'autre équipe. L'idée est que la personne qui reprend le dossier puisse comprendre rapidement ce qui a déjà été fait.",
    answer_en:"I provide a summary of the issue, the symptoms, the checks completed, the results and the exact question that needs another team's help. The goal is for the person taking over to immediately understand what has already been done.",
    story_ids:['ST-01','ST-04'], verified_facts:['Escalation workflow','Complex case handling'], tags:['tier2','escalation','documentation'], risk_flags:[]
  },
  {
    id:'Q-066', category:'Hiring Manager', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'What does ownership mean to you?', variants:['How do you show ownership?','Que signifie pour vous le fait de prendre ses responsabilités ?'],
    intent:'Ownership',
    answer_fr:"Pour moi, prendre ses responsabilités signifie ne pas laisser un problème sans suivi. Je vérifie ce que je peux faire, je communique quand j'ai besoin d'aide et je m'assure que la prochaine étape est claire. Cela ne veut pas dire tout résoudre seul.",
    answer_en:"Ownership means not letting a problem disappear without follow-up. I check what I can do, communicate when I need help, and make sure the next step is clear. It doesn't mean solving everything alone.",
    story_ids:['ST-01','ST-02'], verified_facts:['Process ownership','Agent support'], tags:['ownership','accountability'], risk_flags:[]
  },
  {
    id:'Q-067', category:'Hiring Manager', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you handle a policy you disagree with?', variants:['What if the customer wants an exception you cannot make?','Que faites-vous si vous n’êtes pas d’accord avec une procédure ?'],
    intent:'Policy adherence',
    answer_fr:"Je l'applique tant qu'elle est en vigueur, même si je pense qu'une autre approche serait plus pratique. Si je vois un problème récurrent, je peux le documenter et proposer une amélioration par le bon canal. Pendant l'interaction client, je reste concentré sur ce qui est autorisé.",
    answer_en:"I follow the policy while it is in force, even if I personally think another approach would be more practical. If I notice a recurring problem, I can document it and propose an improvement through the proper channel. During the customer interaction, I stay within what is authorized.",
    story_ids:['ST-01','ST-04'], verified_facts:['Process adherence','Workflow improvement'], tags:['policy','exception','ownership'], risk_flags:[]
  },
  {
    id:'Q-068', category:'Hiring Manager', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you react when a customer rejects your solution?', variants:['What if the customer says your answer is not good enough?','Que faites-vous si le client refuse votre solution ?'],
    intent:'Adaptability',
    answer_fr:"Je cherche à comprendre pourquoi la solution ne répond pas à son besoin. Je reformule le problème, je vérifie si une autre option est autorisée et j'explique clairement les limites de ce que je peux faire. Je ne veux pas simplement répéter la même phrase.",
    answer_en:"I try to understand why the proposed solution doesn't meet their need. I restate the problem, check whether another option is allowed, and explain clearly what I can and cannot do. I don't want to simply repeat the same sentence.",
    story_ids:['ST-04'], verified_facts:['Customer de-escalation','Policy adherence'], tags:['customer','adaptability','solution'], risk_flags:[]
  },
  {
    id:'Q-069', category:'Hiring Manager', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'How do you handle repetitive work without losing quality?', variants:['How do you stay accurate on repetitive tickets?','Comment gardez-vous la qualité sur des tâches répétitives ?'],
    intent:'Consistency',
    answer_fr:"Je m'appuie sur les procédures et une structure de travail stable, mais je reste attentif aux différences entre les dossiers. La répétition aide à devenir rapide, mais je vérifie toujours les informations qui peuvent changer d'un client à l'autre.",
    answer_en:"I rely on a consistent process, but I stay alert to differences between cases. Repetition helps you become faster, but I still verify the details that can change from one customer to another.",
    story_ids:['ST-03'], verified_facts:['High-volume support'], tags:['quality','repetition','accuracy'], risk_flags:[]
  },
  {
    id:'Q-070', category:'French Interview', language:'fr', company:'General', source_type:'verified_candidate',
    question:'Comment décririez-vous votre façon de communiquer avec un client ?', variants:['Quel est votre style de communication avec les clients ?','Comment adaptez-vous votre communication ?'],
    intent:'French communication',
    answer_fr:"Je privilégie une communication simple, directe et professionnelle. Je commence par comprendre le problème, je reformule si nécessaire, puis j'explique la solution ou la prochaine étape avec des mots faciles à comprendre. Je m'adapte aussi au niveau de connaissance et au niveau de stress du client.",
    answer_en:"I prefer communication that is clear, direct and professional. I first understand the issue, restate it if needed, then explain the solution or next step in simple language. I also adapt to the customer's level of knowledge and stress.",
    story_ids:['ST-03','ST-04'], verified_facts:['French professional support','English professional support'], tags:['french','communication','customer'], risk_flags:['Keep spoken French natural rather than academic.']
  },
  {
    id:'Q-071', category:'French Interview', language:'fr', company:'General', source_type:'verified_candidate',
    question:'Comment faites-vous lorsque vous ne comprenez pas exactement la question ?', variants:['Que faites-vous si la demande du client est ambiguë ?'],
    intent:'Clarification',
    answer_fr:"Je préfère poser une question ciblée plutôt que de supposer. Par exemple, je peux demander ce qui s'est passé juste avant le problème, sur quelle plateforme il se produit et ce que le client a déjà essayé. Ensuite, je reformule pour confirmer que j'ai bien compris.",
    answer_en:"I prefer to ask a targeted question rather than assume. For example, I might ask what happened just before the issue, which platform it occurs on, and what the customer already tried. Then I restate the issue to confirm I understood correctly.",
    story_ids:['ST-01','ST-04'], verified_facts:['Troubleshooting and clarification'], tags:['french','clarification','probing'], risk_flags:[]
  },
  {
    id:'Q-072', category:'French Interview', language:'fr', company:'General', source_type:'verified_candidate',
    question:'Comment réagissez-vous lorsqu’un client vous met la pression pour aller plus vite ?', variants:['Le client exige une réponse immédiate, que faites-vous ?'],
    intent:'Pressure and accuracy',
    answer_fr:"Je comprends qu'il souhaite une réponse rapide, mais je ne vais pas sacrifier la précision. Je lui donne d'abord une réponse claire sur ce que je peux confirmer immédiatement, puis je vérifie le reste avant de promettre une solution.",
    answer_en:"I understand they want a quick answer, but I won't sacrifice accuracy. I explain what I can confirm immediately and then verify anything that still needs checking before promising a solution.",
    story_ids:['ST-03'], verified_facts:['High-volume support','Accuracy focus'], tags:['french','pressure','accuracy'], risk_flags:[]
  },
  {
    id:'Q-073', category:'English Interview', language:'en', company:'General', source_type:'verified_candidate',
    question:'Give me an example of a difficult technical case.', variants:['Tell me about a complex troubleshooting case.','Donnez-moi un exemple de cas technique complexe.'],
    intent:'Technical depth',
    answer_fr:"Chez Airalo, certains cas eSIM demandaient de distinguer un problème de configuration, d'appareil, d'eSIM ou de réseau avant de choisir la bonne suite. Je vérifiais les informations disponibles, j'éliminais les causes possibles et, si nécessaire, je transmettais le dossier avec tout le contexte déjà vérifié.",
    answer_en:"At Airalo, some eSIM cases required distinguishing between configuration, device, eSIM or network issues before deciding the next step. I checked the available information, ruled out likely causes and, when needed, escalated the case with the context already verified.",
    story_ids:['ST-01'], verified_facts:['Airalo eSIM technical support'], tags:['english','technical','airalo'], risk_flags:['Do not claim a specific error code or diagnostic artifact unless verified.']
  },
  {
    id:'Q-074', category:'English Interview', language:'en', company:'General', source_type:'verified_candidate',
    question:'Tell me about a time you improved a process.', variants:['Describe a workflow you changed.','Parlez-moi d’une amélioration de processus.'],
    intent:'Process improvement',
    answer_fr:"Chez Airalo, j'ai aidé à structurer un workflow "ask for help" pour les cas complexes ou non résolus. L'objectif était de faire remonter les dossiers avec les bonnes informations afin que les agents seniors puissent les traiter plus efficacement.",
    answer_en:"At Airalo, I helped structure an 'ask for help' workflow for complex or unresolved cases. The goal was to make sure cases reached senior agents with the right information so they could handle them more efficiently.",
    story_ids:['ST-01'], verified_facts:['Airalo workflow'], tags:['english','process','initiative'], risk_flags:['Do not invent quantified efficiency gains.']
  },
  {
    id:'Q-075', category:'English Interview', language:'en', company:'General', source_type:'verified_candidate',
    question:'How do you deal with an unhappy customer when you cannot give them what they want?', variants:['How do you say no professionally?','Comment dites-vous non à un client ?'],
    intent:'Boundary setting',
    answer_fr:"Je reconnais la frustration, j'explique clairement ce qui est possible et ce qui ne l'est pas, puis je cherche une alternative autorisée. Le but n'est pas de gagner un argument, mais de garder la conversation constructive et factuelle.",
    answer_en:"I acknowledge the frustration, explain clearly what is and isn't possible, and look for an allowed alternative. The goal isn't to win an argument; it's to keep the conversation constructive and fact-based.",
    story_ids:['ST-04'], verified_facts:['De-escalation and policy adherence'], tags:['english','no','boundary'], risk_flags:[]
  },
  {
    id:'Q-076', category:'English Interview', language:'en', company:'General', source_type:'verified_candidate',
    question:'How do you prioritize when everything looks urgent?', variants:['How do you decide what to do first?','Comment priorisez-vous quand tout semble urgent ?'],
    intent:'Prioritization',
    answer_fr:"Je compare l'impact client, l'urgence réelle, les délais et la capacité à débloquer d'autres tâches. Ensuite, je traite d'abord ce qui présente le plus de risque ou d'impact, puis je communique s'il faut réorganiser les priorités.",
    answer_en:"I compare customer impact, actual urgency, deadlines and whether one task can unblock others. Then I handle the highest-risk or highest-impact item first and communicate if priorities need to be reshuffled.",
    story_ids:['ST-03'], verified_facts:['Prioritization under high chat volume'], tags:['english','prioritization'], risk_flags:[]
  },
  {
    id:'Q-077', category:'English Interview', language:'en', company:'General', source_type:'verified_candidate',
    question:'What would your teammates say about you?', variants:['How would colleagues describe working with you?','Que diraient vos collègues de vous ?'],
    intent:'Team fit',
    answer_fr:"Je pense qu'ils diraient que je suis quelqu'un de calme sur les cas complexes, assez accessible lorsqu'un collègue a besoin d'aide et attentif au respect des procédures. J'essaie aussi de partager les solutions quand je vois un problème qui revient.",
    answer_en:"I think they'd say I'm calm on complex cases, approachable when a teammate needs help, and careful about following procedures. I also try to share practical solutions when I notice a problem repeating.",
    story_ids:['ST-01','ST-02'], verified_facts:['Peer support','Workflow improvement'], tags:['english','teamwork'], risk_flags:['Do not attribute direct quotes to coworkers.']
  },
  {
    id:'Q-078', category:'English Interview', language:'en', company:'General', source_type:'verified_candidate',
    question:'What is something you learned from working in gaming support?', variants:['What did Epic Games teach you?','Qu’avez-vous appris du support gaming ?'],
    intent:'Learning',
    answer_fr:"Le support gaming m'a appris à distinguer l'émotion du problème réel. Un joueur peut être très frustré parce qu'un achat ou un compte ne fonctionne pas, mais la bonne réponse consiste à vérifier les faits, suivre la procédure et expliquer clairement la suite.",
    answer_en:"Gaming support taught me to separate emotion from the actual problem. A player can be extremely frustrated about an account or purchase issue, but the right response is to verify the facts, follow the process and explain the next step clearly.",
    story_ids:['ST-04'], verified_facts:['Epic Games support','Gaming de-escalation'], tags:['english','gaming','learning'], risk_flags:[]
  },
  {
    id:'Q-079', category:'English Interview', language:'en', company:'General', source_type:'verified_candidate',
    question:'How do you learn a new internal tool quickly?', variants:['How do you adapt to new systems?','Comment apprenez-vous rapidement un nouvel outil ?'],
    intent:'Tool adaptability',
    answer_fr:"Je commence par comprendre le workflow plutôt que seulement l'interface : ce que l'outil permet, quelles informations sont importantes et quelles actions sont autorisées. Ensuite, je pratique sur des cas réels ou de formation et je documente les points qui reviennent souvent.",
    answer_en:"I start by understanding the workflow rather than just the interface: what the tool does, what information matters and what actions are allowed. Then I practice with real or training cases and document the points that come up repeatedly.",
    story_ids:[], verified_facts:['Wide support-tool exposure'], tags:['english','tools','learning'], risk_flags:['Do not claim expert system-administration skills.']
  },
  {
    id:'Q-080', category:'Interview Pressure', language:'mixed', company:'General', source_type:'scenario_roleplay',
    question:'I disagree with your answer. Defend it.', variants:['The interviewer challenges your reasoning. What do you do?','Je ne suis pas d’accord avec votre réponse. Défendez-la.'],
    intent:'Pressure response',
    answer_fr:"Je peux expliquer mon raisonnement, mais je commence par vérifier si j'ai bien compris les nouveaux éléments. Si un fait change, je préfère ajuster ma réponse plutôt que défendre une hypothèse devenue incorrecte. Pour moi, l'objectif est d'avoir la bonne réponse, pas de gagner le débat.",
    answer_en:"I can explain my reasoning, but I first check whether I've understood the new information correctly. If a fact changes, I would adjust my answer rather than defend an assumption that is no longer valid. The goal is to reach the correct answer, not win the argument.",
    story_ids:[], verified_facts:['Fact-first support philosophy'], tags:['curveball','pressure','reasoning'], risk_flags:[]
  },
  {
    id:'Q-081', category:'Interview Pressure', language:'mixed', company:'General', source_type:'scenario_roleplay',
    question:'You gave the wrong answer earlier. What do you do now?', variants:['How do you recover from an incorrect answer?','Vous venez de vous rendre compte que votre réponse précédente était incorrecte.'],
    intent:'Self-correction',
    answer_fr:"Je le reconnais clairement et je corrige l'information. Je préfère dire "j'avais mal compris ce point" plutôt que de chercher une justification. Ensuite, je vérifie le bon fait ou la bonne procédure avant de continuer.",
    answer_en:"I acknowledge it clearly and correct the information. I'd rather say I misunderstood that point than try to justify the mistake. Then I verify the correct fact or process before continuing.",
    story_ids:[], verified_facts:['No-guessing principle'], tags:['curveball','mistake','integrity'], risk_flags:[]
  },
  {
    id:'Q-082', category:'Interview Pressure', language:'mixed', company:'General', source_type:'scenario_roleplay',
    question:'Give me a one-sentence answer only.', variants:['Answer in 10 seconds.','Répondez en une seule phrase.'],
    intent:'Concision',
    answer_fr:"J'ai plus de six ans d'expérience en support client et technique, avec une forte exposition au gaming, aux cas complexes et aux environnements internationaux.",
    answer_en:"I have more than six years of customer and technical support experience, with strong exposure to gaming, complex cases and international environments.",
    story_ids:[], verified_facts:['6+ years experience','Gaming support','Technical support'], tags:['curveball','concise','intro'], risk_flags:[]
  },
  {
    id:'Q-083', category:'Interview Pressure', language:'mixed', company:'General', source_type:'scenario_roleplay',
    question:'What would you do if the customer is clearly wrong?', variants:['How do you correct a customer without embarrassing them?','Que faites-vous si le client se trompe clairement ?'],
    intent:'Empathy and correction',
    answer_fr:"Je ne cherche pas à lui montrer qu'il a tort. Je vérifie les faits, puis j'explique calmement ce que le système ou les informations disponibles montrent et quelle est la prochaine étape. Le client doit comprendre la situation sans se sentir humilié.",
    answer_en:"I don't try to prove the customer wrong. I verify the facts, then explain calmly what the system or available information shows and what the next step is. The customer should understand the situation without feeling embarrassed.",
    story_ids:['ST-04'], verified_facts:['De-escalation'], tags:['customer','correction','empathy'], risk_flags:[]
  },
  {
    id:'Q-084', category:'Interview Pressure', language:'mixed', company:'General', source_type:'scenario_roleplay',
    question:'What if you are asked to break a rule for a VIP customer?', variants:['Would you make an exception for an important customer?','Et si un client VIP demande une exception ?'],
    intent:'Integrity',
    answer_fr:"Je suivrais la procédure applicable comme pour les autres clients. Si une exception officielle existe, je vérifierais qu'elle s'applique réellement au cas. Je ne contournerais pas une règle de sécurité ou de conformité de ma propre initiative.",
    answer_en:"I would follow the applicable process like I would for other customers. If an official exception exists, I would verify that it actually applies. I would not bypass a security or compliance rule on my own.",
    story_ids:[], verified_facts:['Policy adherence'], tags:['integrity','VIP','policy'], risk_flags:[]
  },
  {
    id:'Q-085', category:'Interview Pressure', language:'mixed', company:'General', source_type:'scenario_roleplay',
    question:'What if you cannot solve the issue before the customer leaves?', variants:['How do you close an unresolved interaction?','Et si le problème n’est pas résolu avant la fin du contact ?'],
    intent:'Expectation management',
    answer_fr:"Je résume ce qui a été vérifié, je dis clairement ce qui reste à faire et je donne la prochaine étape disponible. Je m'assure aussi que le dossier contient tout le contexte nécessaire pour éviter que le client doive recommencer depuis le début.",
    answer_en:"I summarize what has been checked, explain clearly what remains and give the next available step. I also make sure the case contains the necessary context so the customer doesn't have to start over.",
    story_ids:['ST-01','ST-04'], verified_facts:['Escalation/documentation'], tags:['closing','unresolved','ownership'], risk_flags:[]
  },
  {
    id:'Q-086', category:'Company Specific', language:'mixed', company:'TransPerfect', source_type:'researched_role',
    question:'Why TransPerfect Gaming specifically?', variants:['Why TransPerfect instead of another support company?','Pourquoi TransPerfect Gaming spécifiquement ?'],
    intent:'Company fit',
    answer_fr:"Parce que le poste rapproche directement mon expérience Epic Games, mon français professionnel et mon expérience du support à volume élevé. Je connais déjà les types de problèmes que peuvent rencontrer les joueurs et j'apprécie la combinaison entre support, technologie et environnement gaming.",
    answer_en:"Because the role directly connects my Epic Games experience, professional French and high-volume support background. I already understand the kinds of issues players can face, and I like the combination of support, technology and gaming.",
    story_ids:['ST-04','ST-03'], verified_facts:['Epic Games support','French professional support','High-volume chat'], tags:['transperfect','why company','gaming'], risk_flags:['Do not claim current company processes you have not verified.']
  },
  {
    id:'Q-087', category:'Company Specific', language:'mixed', company:'TapTap Send', source_type:'researched_role',
    question:'Why TapTap Send specifically?', variants:['Why this company?','Pourquoi TapTap Send ?'],
    intent:'Company fit',
    answer_fr:"Le produit a un impact direct sur des personnes qui envoient de l'argent à leur famille, donc le support demande à la fois empathie et précision. J'aime aussi la culture autour de la recherche de solutions concrètes et du fait de prendre ses responsabilités, qui correspond à mon expérience en résolution de cas et en amélioration de workflows.",
    answer_en:"The product has a direct impact on people sending money to their families, so support requires both empathy and precision. I also like the company's focus on practical solutions and accountability, which fits my experience with complex cases and workflow improvement.",
    story_ids:['ST-01','ST-02'], verified_facts:['Complex support','Workflow improvement'], tags:['taptap','why company','values'], risk_flags:['Keep current company values in a separate researched layer.']
  },
  {
    id:'Q-088', category:'Questions to Ask', language:'mixed', company:'General', source_type:'scenario_roleplay',
    question:'What questions should you ask the interviewer?', variants:['Do you have any questions for us?','Avez-vous des questions pour nous ?'],
    intent:'Candidate questions',
    answer_fr:"Oui. J'aimerais savoir à quoi ressemble une journée type sur ce poste, comment la qualité est mesurée, et à quoi ressemble la formation des nouveaux agents. J'aimerais aussi comprendre ce qui distingue les personnes qui réussissent le mieux dans l'équipe après les premiers mois.",
    answer_en:"Yes. I'd like to understand what a typical day looks like, how quality is measured, and what onboarding and training look like. I'd also like to know what tends to distinguish people who perform well after their first few months.",
    story_ids:[], verified_facts:[], tags:['questions','closing','interview'], risk_flags:[]
  },
  {
    id:'Q-089', category:'Closing', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Is there anything else you would like us to know?', variants:['Any final comments?','Y a-t-il autre chose que vous souhaitez ajouter ?'],
    intent:'Closing statement',
    answer_fr:"Simplement que je suis particulièrement à l'aise dans les environnements où il faut comprendre rapidement un problème, rester calme avec le client et suivre un processus fiable. Mon parcours m'a donné une expérience assez large, et je cherche maintenant à la mettre au service d'une équipe sur le long terme.",
    answer_en:"Only that I'm particularly comfortable in environments where I need to understand a problem quickly, stay calm with the customer and follow a reliable process. My background has given me broad support experience, and I'm now looking to bring that to a team long term.",
    story_ids:['ST-01','ST-03','ST-04'], verified_facts:['Broad support experience','Long-term role target'], tags:['closing','final','summary'], risk_flags:[]
  },
  {
    id:'Q-090', category:'Career / Education', language:'mixed', company:'General', source_type:'verified_candidate',
    question:'Why did you study English Literature and move into support?', variants:['How does your education relate to your career?','Pourquoi avoir étudié la littérature anglaise puis travaillé dans le support ?'],
    intent:'Education narrative',
    answer_fr:"Mes études m'ont surtout donné une bonne base en communication, compréhension de texte et expression en anglais. Ensuite, j'ai découvert que j'aimais davantage le côté opérationnel et concret du support, où je pouvais utiliser ces compétences tout en développant le dépannage et la résolution de problèmes.",
    answer_en:"My studies gave me a strong foundation in communication, reading and English expression. I then discovered I enjoyed the practical, operational side of support, where I could use those skills while developing troubleshooting and problem-solving experience.",
    story_ids:[], verified_facts:['DEUG in English Literature','Support career'], tags:['education','career'], risk_flags:['Do not imply a computer science degree.']
  }
];
