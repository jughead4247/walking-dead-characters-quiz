/* ============================================================
   THE WALKING DEAD — PERSONALITY QUIZ ENGINE
   30 questions • 16 traits • 19 characters

   Calibration:
   - theoretical min/max normalization per trait
   - neutral/moderate profile is centered around ~65
   - final profile remains 5–95
   - weighted character matching
   ============================================================ */

const TRAIT_KEYS = [
    "selfPreservation", "courage", "empathy", "loyalty",
    "morality", "pragmatism", "ruthlessness", "leadership",
    "independence", "trust", "charisma", "manipulation",
    "strategy", "hope", "emotionalControl", "riskAppetite"
];

const TWD_TRAITS = [
    "Self-Preservation", "Courage", "Empathy", "Loyalty",
    "Morality", "Pragmatism", "Ruthlessness", "Leadership",
    "Independence", "Trust", "Charisma", "Manipulation",
    "Strategy", "Hope", "Emotional Control", "Risk Appetite"
];

const TRAIT_WEIGHTS = {
    selfPreservation: 1.0, courage: 1.0, empathy: 1.0, loyalty: 1.0,
    morality: 1.0, pragmatism: 1.0, ruthlessness: 0.9, leadership: 1.0,
    independence: 0.9, trust: 0.8, charisma: 0.8, manipulation: 0.9,
    strategy: 1.0, hope: 0.9, emotionalControl: 0.9, riskAppetite: 0.9
};

/* ------------------------------------------------------------
   CHARACTER MATRIX
   Order exactly matches TRAIT_KEYS.
   ------------------------------------------------------------ */

const TWD_CHARACTERS = {
    rick: { name:"Rick Grimes", image:"images/rick.jpg", scores:[82,91,80,91,77,87,74,94,72,53,79,57,88,89,58,85] },
    daryl: { name:"Daryl Dixon", image:"images/daryl.jpg", scores:[93,90,77,94,74,89,70,65,95,34,50,40,87,83,87,80] },
    carol: { name:"Carol Peletier", image:"images/carol.jpg", scores:[92,86,72,87,61,94,86,69,91,42,61,88,93,87,79,78] },
    shane: { name:"Shane Walsh", image:"images/shane.jpg", scores:[89,88,57,72,48,91,87,81,83,43,75,69,78,67,39,88] },
    glenn: { name:"Glenn Rhee", image:"images/glenn.jpg", scores:[66,82,93,92,91,68,29,63,61,78,76,22,74,91,72,67] },
    michonne: { name:"Michonne", image:"images/michonne.jpg", scores:[86,91,82,90,84,83,70,82,94,54,67,45,88,88,93,70] },
    maggie: { name:"Maggie Greene", image:"images/maggie.jpg", scores:[77,87,84,93,80,82,76,87,84,56,79,41,80,93,76,75] },
    hershel: { name:"Hershel Greene", image:"images/hershel.jpg", scores:[61,76,94,90,94,67,18,74,58,81,79,15,61,89,83,43] },
    abraham: { name:"Abraham Ford", image:"images/abraham.jpg", scores:[84,94,65,83,64,88,74,86,83,52,88,34,78,79,77,94] },
    eugene: { name:"Eugene Porter", image:"images/eugene.jpg", scores:[91,43,69,81,72,83,25,47,73,48,55,67,91,78,71,29] },
    negan: { name:"Negan", image:"images/negan.jpg", scores:[88,87,52,73,42,91,91,94,76,38,93,89,86,74,82,81] },
    governor: { name:"The Governor", image:"images/governor.jpg", scores:[93,82,31,68,24,87,94,91,84,21,88,94,85,62,54,77] },
    morgan: { name:"Morgan Jones", image:"images/morgan.jpg", scores:[72,79,91,86,89,53,46,63,68,64,58,31,70,81,38,57] },
    gabriel: { name:"Gabriel Stokes", image:"images/gabriel.jpg", scores:[82,58,81,79,88,70,41,61,52,57,64,45,73,92,76,48] },
    ezekiel: { name:"Ezekiel", image:"images/ezekiel.jpg", scores:[67,78,88,88,82,65,31,86,63,69,94,58,72,90,73,59] },
    gregory: { name:"Gregory", image:"images/gregory.jpg", scores:[94,22,36,34,39,72,28,57,61,31,67,81,68,48,29,16] },
    gareth: { name:"Gareth", image:"images/gareth.jpg", scores:[89,76,12,57,14,91,94,78,82,12,64,91,88,55,86,72] },
    dawn: { name:"Dawn Lerner", image:"images/dawn.jpg", scores:[79,68,61,73,47,83,63,89,55,39,62,72,76,64,67,49] },
    bob: { name:"Bob Stookey", image:"images/bob.jpg", scores:[64,74,91,86,88,59,21,48,63,82,69,18,66,94,84,61] }
};

/* ------------------------------------------------------------
   QUESTIONS
   Each answer contains only the defined 16 traits.
   ------------------------------------------------------------ */

const TWD_PERSONALITY_QUESTIONS = [
{
id:1, question:"Your group has just arrived at an unfamiliar settlement. It's getting dark, and one of the residents has disappeared. The leader says nobody goes outside until morning. You hear something moving outside the walls. What do you do?",
answers:[
{text:"Stay inside. Going out at night without knowing what's out there is stupid.",traits:{selfPreservation:3,courage:-1,strategy:1,independence:1,riskAppetite:-2}},
{text:"Go outside alone and find out what happened.",traits:{selfPreservation:-1,courage:3,leadership:1,independence:3,riskAppetite:3}},
{text:"Ask for a small team and search while keeping a safe route back.",traits:{selfPreservation:1,courage:2,leadership:3,strategy:3,riskAppetite:1}},
{text:"Ignore the missing person. If the leader isn't worried, neither am I.",traits:{selfPreservation:2,courage:-2,leadership:-2,strategy:-1,independence:-1,riskAppetite:-2}},
{text:"Secretly prepare an escape route in case the settlement is attacked.",traits:{selfPreservation:3,leadership:1,strategy:3,independence:2,riskAppetite:-1}}
]},
{
id:2, question:"A member of your group admits that they betrayed you months ago. Their actions indirectly caused several people to die. They've been hiding the truth because they were afraid you'd kill them. Now they're genuinely remorseful. What matters most when deciding what to do?",
answers:[
{text:"Whether they can prove they're genuinely sorry.",traits:{empathy:3,morality:1,trust:2,ruthlessness:-1,emotionalControl:2}},
{text:"Whether keeping them alive puts the group at risk.",traits:{pragmatism:3,morality:1,ruthlessness:2,trust:-2,emotionalControl:3}},
{text:"What they actually intended when they betrayed us.",traits:{empathy:2,morality:2,pragmatism:1,trust:1,emotionalControl:2}},
{text:"The fact that they betrayed us cannot be undone.",traits:{morality:3,trust:-3,ruthlessness:1,emotionalControl:1}},
{text:"Whether they're still useful to the group.",traits:{pragmatism:3,morality:-2,empathy:-1,trust:-1,emotionalControl:2}}
]},
{
id:3, question:"Your group discovers a large herd approaching. There is only enough time to evacuate one section of the settlement. Everyone starts arguing. Nobody wants to make the final decision because whichever section you choose will be abandoned. What do you do?",
answers:[
{text:"Make the decision myself and accept responsibility.",traits:{leadership:3,courage:2,pragmatism:1,strategy:1,emotionalControl:3}},
{text:"Force everyone to vote.",traits:{leadership:1,morality:2,strategy:1,emotionalControl:1}},
{text:"Quickly calculate which section gives us the best chance of survival.",traits:{leadership:2,courage:1,pragmatism:3,strategy:3,morality:-1,emotionalControl:3}},
{text:"Ask the most experienced person to decide.",traits:{leadership:-1,courage:-1,pragmatism:1,strategy:2,emotionalControl:2}},
{text:"Refuse to choose who gets left behind.",traits:{leadership:-2,morality:3,pragmatism:-3,courage:-1,emotionalControl:-1}}
]},
{
id:4, question:"You need to retrieve medicine from a pharmacy two miles away. A dangerous area lies between your settlement and the pharmacy. You have never been there before. What do you do?",
answers:[
{text:"Go immediately. Someone has to do it.",traits:{courage:3,selfPreservation:-1,riskAppetite:3,independence:2,pragmatism:1}},
{text:"Study the area first and plan the safest route.",traits:{courage:1,selfPreservation:2,strategy:3,pragmatism:3,riskAppetite:-1}},
{text:"Send someone more experienced instead.",traits:{courage:-1,selfPreservation:2,strategy:1,independence:-1,riskAppetite:-1}},
{text:"Go, but only with two other people.",traits:{courage:2,selfPreservation:1,strategy:1,pragmatism:2,riskAppetite:1}},
{text:"Decide the medicine isn't worth the risk.",traits:{courage:-2,selfPreservation:3,strategy:1,pragmatism:2,riskAppetite:-3}}
]},
{
id:5, question:"A lone survivor arrives at your settlement. They appear injured and exhausted and ask for shelter. You have no way of knowing whether they're telling the truth. What do you do?",
answers:[
{text:"Let them in. They clearly need help.",traits:{empathy:3,trust:3,morality:2,selfPreservation:-2,strategy:-1}},
{text:"Let them stay somewhere isolated until we know more about them.",traits:{empathy:1,selfPreservation:3,strategy:2,morality:1}},
{text:"Refuse them. We can't risk the group.",traits:{empathy:-1,trust:-3,selfPreservation:3,strategy:1}},
{text:"Let them in but quietly search their belongings.",traits:{empathy:1,trust:-2,selfPreservation:2,strategy:2,morality:-1,manipulation:2}},
{text:"Ask them questions first and judge their story.",traits:{empathy:2,trust:1,selfPreservation:1,strategy:3,morality:1}}
]},
{
id:6, question:"Your group reaches a bridge. Only one person can cross at a time because the structure is unstable. A child is trapped on the other side. The bridge probably won't support another adult carrying them. What do you do?",
answers:[
{text:"Go get the child. I'll take the risk.",traits:{empathy:3,courage:3,morality:2,riskAppetite:3,pragmatism:-1}},
{text:"Find another way around, even if it takes hours.",traits:{empathy:3,morality:3,strategy:2,riskAppetite:-1,leadership:2}},
{text:"Send the strongest person.",traits:{empathy:1,courage:2,pragmatism:3,riskAppetite:1}},
{text:"Tell the child to try crossing alone.",traits:{morality:-1,pragmatism:2,courage:1,riskAppetite:1}},
{text:"Leave the child. We can't risk losing more people.",traits:{empathy:-2,morality:-2,pragmatism:3,riskAppetite:-3}}
]},
{
id:7, question:"Your settlement's leader suddenly dies. Everyone looks toward you. You never asked for leadership. The settlement needs someone immediately. What do you do?",
answers:[
{text:"Take command. Someone has to keep everyone organized.",traits:{leadership:3,independence:2,charisma:1,strategy:1}},
{text:"Ask the group to choose someone else.",traits:{leadership:-2,trust:1,emotionalControl:1}},
{text:"Take temporary command until a better leader emerges.",traits:{leadership:2,strategy:3,independence:1,trust:1}},
{text:"Tell everyone to work together without having a single leader.",traits:{leadership:1,independence:2,charisma:2,trust:2}},
{text:"Take command, but make sure trusted people advise me.",traits:{leadership:3,charisma:2,strategy:3,trust:3,independence:1}}
]},
{
id:8, question:"You finally capture the person responsible for killing someone you loved. But you discover their family had nothing to do with it. They are now completely helpless. You have control over what happens to them.",
answers:[
{text:"Leave the family alone. They aren't responsible.",traits:{morality:3,empathy:3,ruthlessness:-3,manipulation:-1,loyalty:1}},
{text:"Keep them nearby as insurance against retaliation.",traits:{ruthlessness:1,manipulation:2,pragmatism:3,empathy:-1}},
{text:"Release them, but warn them never to come back.",traits:{morality:2,empathy:1,ruthlessness:-1,pragmatism:1}},
{text:"Use them to force the killer to surrender.",traits:{morality:-2,empathy:-2,ruthlessness:2,manipulation:3,pragmatism:3}},
{text:"I don't care who they are. Their family chose their side.",traits:{morality:-3,empathy:-3,ruthlessness:3,loyalty:2,manipulation:1}}
]},
{
id:9, question:"Your settlement is about to panic. You know that an attack is likely tomorrow. If you tell everyone the truth, some people may flee and make the settlement easier to attack. If you lie, you can keep everyone calm and organized. What do you do?",
answers:[
{text:"Tell everyone the truth. They deserve to decide for themselves.",traits:{morality:3,trust:3,manipulation:-2,leadership:1,charisma:1}},
{text:"Tell only the people responsible for defense.",traits:{leadership:2,strategy:2,manipulation:1,emotionalControl:3,trust:-1}},
{text:"Tell everyone that everything is under control, even if it isn't.",traits:{charisma:3,manipulation:3,leadership:3,strategy:2,morality:-2,trust:-3}},
{text:"Give people enough information to prepare without causing panic.",traits:{morality:2,charisma:2,leadership:2,strategy:3,trust:1,emotionalControl:3}},
{text:"Tell the lie now and explain everything after the danger passes.",traits:{manipulation:3,strategy:3,leadership:2,morality:-1,trust:-2}}
]},
{
id:10, question:'You have one bullet left. A walker is about to attack your closest friend. At the same time, another person is trapped nearby and will also die if you don\'t help them. You can only save one. Your friend looks at you and says, "Save them." What do you do?',
answers:[
{text:"Save my friend. I can't let someone I love die.",traits:{loyalty:3,empathy:2,morality:-1,pragmatism:-1,emotionalControl:-2}},
{text:"Do what my friend asked and save the stranger.",traits:{loyalty:2,empathy:3,morality:3,emotionalControl:2,pragmatism:-1}},
{text:"Try to save both, even if there's a very high chance I fail.",traits:{loyalty:2,empathy:2,morality:1,riskAppetite:3,emotionalControl:-3,pragmatism:-2}},
{text:"Save whoever I believe has the better chance of surviving afterward.",traits:{loyalty:1,pragmatism:3,morality:1,emotionalControl:3,riskAppetite:-1}},
{text:"Freeze for a moment. I don't know if I could choose.",traits:{loyalty:1,empathy:1,pragmatism:-2,emotionalControl:-3,courage:-1}}
]},
{
id:11, question:"Someone you trusted caused the death of a member of your group through a reckless decision. They admit what they did and say they want to make things right. What do you do?",
answers:[
{text:"Give them a chance. They can't undo it, but they can prove themselves.",traits:{empathy:2,loyalty:2,morality:1,trust:2,emotionalControl:2,ruthlessness:-1}},
{text:"Keep them around, but never trust them again.",traits:{loyalty:1,morality:1,trust:-2,emotionalControl:3,ruthlessness:1,pragmatism:2}},
{text:"Make them leave. Some things destroy trust permanently.",traits:{morality:2,trust:-3,ruthlessness:1,emotionalControl:2,independence:1}},
{text:"Keep them because they're useful to the group.",traits:{pragmatism:3,morality:-2,empathy:-1,ruthlessness:1,emotionalControl:2}},
{text:"Make them face consequences before deciding anything.",traits:{morality:2,pragmatism:2,ruthlessness:1,emotionalControl:3,trust:-1}}
]},
{
id:12, question:"Your group is escaping a settlement that's about to be overrun. One person has to stay behind and operate the gate manually. Nobody volunteers. What do you do?",
answers:[
{text:"Stay behind myself.",traits:{courage:3,loyalty:3,empathy:2,riskAppetite:3,selfPreservation:-2}},
{text:"Choose whoever has the best chance of surviving.",traits:{pragmatism:3,strategy:2,emotionalControl:3,morality:1}},
{text:"Draw lots. Everyone should have an equal chance.",traits:{morality:3,trust:2,leadership:1,pragmatism:-1}},
{text:"Order someone to do it. There's no time for arguments.",traits:{leadership:3,courage:2,pragmatism:2,ruthlessness:1,emotionalControl:2}},
{text:"Look for another solution, even if it delays our escape.",traits:{empathy:3,morality:3,strategy:3,riskAppetite:-1,leadership:1}}
]},
{
id:13, question:"You've been leading your group for months. One of your closest people openly challenges your decisions in front of everyone. What do you do?",
answers:[
{text:"Listen to their argument before responding.",traits:{empathy:2,trust:2,emotionalControl:3,leadership:1,independence:1}},
{text:"Make it clear that the final decision is mine.",traits:{leadership:3,independence:2,charisma:1,emotionalControl:2,trust:-1}},
{text:"Let the group decide who is right.",traits:{trust:3,morality:2,leadership:-1,independence:-1}},
{text:"Privately confront them afterward.",traits:{strategy:2,emotionalControl:3,leadership:1,manipulation:1}},
{text:"Ignore the challenge and continue with the plan.",traits:{leadership:2,independence:2,emotionalControl:3,trust:-2,empathy:-1}}
]},
{
id:14, question:"Someone in your group has become increasingly unstable. They haven't actually hurt anyone yet, but several people are afraid of them. What do you do?",
answers:[
{text:"Remove them before something happens.",traits:{selfPreservation:3,pragmatism:3,ruthlessness:2,strategy:2,empathy:-2}},
{text:"Keep an eye on them but give them a chance.",traits:{empathy:2,morality:2,trust:1,emotionalControl:2,selfPreservation:1}},
{text:"Ask them directly what's happening.",traits:{empathy:3,trust:2,morality:2,emotionalControl:2}},
{text:"Put restrictions on what they can do.",traits:{pragmatism:3,strategy:3,leadership:2,selfPreservation:2}},
{text:"Do nothing until they actually become a threat.",traits:{trust:1,empathy:1,morality:-1,riskAppetite:2,selfPreservation:-1}}
]},

{
id:15, question:"Your group has suffered several major failures. Food is running out, people are exhausted, and everyone is starting to believe survival is impossible. What is your reaction?",
answers:[
{text:"Keep everyone focused on the possibility of rebuilding.",traits:{hope:3,empathy:2,leadership:2,charisma:2,emotionalControl:2}},
{text:"Stop pretending things will get better and focus only on surviving today.",traits:{pragmatism:3,selfPreservation:2,hope:-2,emotionalControl:3}},
{text:"Look for somewhere completely new to start over.",traits:{hope:2,independence:2,strategy:3,riskAppetite:1}},
{text:"Tell everyone that giving up isn't an option.",traits:{hope:3,leadership:3,charisma:2,courage:2}},
{text:"Accept that some people won't make it and concentrate on those who can.",traits:{pragmatism:3,selfPreservation:2,morality:-1,emotionalControl:3,hope:-1}}
]},
{
id:16, question:"Your closest friend accidentally killed someone while defending themselves. Nobody else knows. They beg you not to tell anyone. What do you do?",
answers:[
{text:"Keep the secret. They trusted me.",traits:{loyalty:3,trust:2,morality:-1,empathy:2,independence:1}},
{text:"Tell the leader privately.",traits:{morality:2,strategy:2,emotionalControl:3,trust:-1}},
{text:"Convince my friend to confess themselves.",traits:{loyalty:2,morality:3,empathy:2,leadership:1,manipulation:-1}},
{text:"Hide the evidence but make sure it never happens again.",traits:{loyalty:2,manipulation:2,strategy:3,morality:-2,pragmatism:2}},
{text:"Tell everyone. Nobody should be above the rules.",traits:{morality:3,courage:2,trust:2,loyalty:-1,ruthlessness:1}}
]},
{
id:17, question:"You discover a small settlement that has almost no weapons and is desperately short of food. Your group has enough supplies to help them—but taking control of their settlement would give your people an extremely secure base. What do you do?",
answers:[
{text:"Help them and leave them independent.",traits:{empathy:3,morality:3,trust:2,ruthlessness:-2,leadership:1}},
{text:"Offer protection in exchange for cooperation.",traits:{leadership:2,pragmatism:3,charisma:2,manipulation:1}},
{text:"Take control. Security comes first.",traits:{leadership:3,ruthlessness:3,pragmatism:3,manipulation:2,empathy:-2}},
{text:"Negotiate a partnership where both groups benefit.",traits:{charisma:2,morality:2,leadership:2,trust:2,strategy:2}},
{text:"Take what we need and leave before conflict develops.",traits:{selfPreservation:3,pragmatism:3,independence:2,morality:-1,riskAppetite:-1}}
]},
{
id:18, question:"Someone extremely important to you dies. Your group needs you immediately, but you are emotionally devastated. What do you do?",
answers:[
{text:"Put my feelings aside and get back to work.",traits:{emotionalControl:3,leadership:2,courage:2,loyalty:2,hope:1}},
{text:"Take some time alone before returning.",traits:{emotionalControl:1,independence:2,empathy:2}},
{text:"Stay with the group because I don't want them facing danger without me.",traits:{loyalty:3,empathy:2,courage:1,hope:2}},
{text:"Become obsessed with finding whoever caused their death.",traits:{ruthlessness:3,loyalty:3,riskAppetite:2,emotionalControl:-2,manipulation:1}},
{text:"I don't know if I could function normally for a while.",traits:{empathy:2,emotionalControl:-3,hope:-2,courage:-1}}
]},
{
id:19, question:"You discover a shortcut to safety. The route is dangerous, but taking it could save your group several days of travel. What do you choose?",
answers:[
{text:"Take it. We can't afford to waste time.",traits:{riskAppetite:3,courage:2,pragmatism:2,independence:2,selfPreservation:-1}},
{text:"Investigate the route before deciding.",traits:{strategy:3,selfPreservation:2,pragmatism:2,riskAppetite:-1,emotionalControl:2}},
{text:"Avoid it. A known route is safer.",traits:{selfPreservation:3,riskAppetite:-2,pragmatism:1,strategy:1}},
{text:"Send two people ahead to test it.",traits:{strategy:3,pragmatism:2,leadership:1,riskAppetite:1}},
{text:"Take it only if the group has no safer alternative.",traits:{pragmatism:3,strategy:2,selfPreservation:2,riskAppetite:-1}}
]},
{
id:20, question:"You find two injured strangers. You have enough medicine to save only one. One is young and has a family waiting for them. The other is older but has valuable medical knowledge that could help your group survive. Who gets the medicine?",
answers:[
{text:"The younger person. They have more life ahead of them.",traits:{empathy:3,morality:2,hope:1,pragmatism:-1}},
{text:"The medical expert. Saving them could save many others.",traits:{pragmatism:3,strategy:3,morality:1}},
{text:"Whoever is in greater immediate danger.",traits:{morality:2,empathy:2,emotionalControl:2,pragmatism:2}},
{text:"Let them decide who should receive it.",traits:{morality:3,trust:3,empathy:2,leadership:-1}},
{text:"Split the medicine and try to save both.",traits:{empathy:3,courage:2,riskAppetite:2,hope:2,pragmatism:-2}}
]},
{
id:21, question:"You give your group an order during an attack. Someone ignores you, makes their own decision, and accidentally saves several people. What do you do afterward?",
answers:[
{text:"Punish them. Disobeying orders can get people killed.",traits:{leadership:3,pragmatism:2,ruthlessness:1,emotionalControl:2}},
{text:"Admit that their decision was better this time.",traits:{morality:2,leadership:1,emotionalControl:3,independence:2}},
{text:"Thank them, but make it clear that they can't ignore orders whenever they want.",traits:{leadership:3,pragmatism:2,emotionalControl:3,trust:1}},
{text:"Change the way decisions are made so people can act independently when necessary.",traits:{independence:3,strategy:3,leadership:2,trust:2}},
{text:"Forget about the disagreement. The important thing is that people survived.",traits:{pragmatism:3,emotionalControl:3,morality:1}}
]},
{
id:22, question:"Your group captures an enemy who knows the location of a dangerous opposing faction. They refuse to talk. You have several ways to make them cooperate.",
answers:[
{text:"Threaten them but don't physically hurt them.",traits:{leadership:2,ruthlessness:1,manipulation:2,emotionalControl:2}},
{text:"Offer them something they want in exchange for information.",traits:{pragmatism:3,charisma:2,manipulation:1,morality:1}},
{text:"Try to convince them that helping us is in their interest.",traits:{charisma:3,manipulation:3,empathy:1,strategy:2}},
{text:"Interrogate them aggressively if necessary.",traits:{ruthlessness:3,pragmatism:3,manipulation:2,morality:-2}},
{text:"Let them go. We shouldn't become the kind of people we hate.",traits:{morality:3,empathy:2,ruthlessness:-3,independence:1}}
]},
{
id:23, question:"Your group has enough food for five days. You discover that three more survivors have arrived. If everyone shares equally, everyone may become dangerously weak before help arrives. What do you do?",
answers:[
{text:"Share everything equally.",traits:{morality:3,empathy:3,loyalty:2,pragmatism:-1}},
{text:"Prioritize children and vulnerable people.",traits:{empathy:3,morality:2,leadership:2,pragmatism:1}},
{text:"Give more food to people doing essential work.",traits:{pragmatism:3,strategy:2,leadership:2}},
{text:"Hide some of the food for an emergency.",traits:{selfPreservation:3,strategy:3,pragmatism:2,trust:-1}},
{text:"Tell the newcomers there isn't enough and refuse them.",traits:{selfPreservation:3,pragmatism:3,empathy:-2,morality:-2}}
]},
{
id:24, question:"Someone proves that one of your decisions could put the entire group in danger. You genuinely believe they are correct. What do you do?",
answers:[
{text:"Change the plan immediately.",traits:{emotionalControl:3,strategy:3,independence:1,morality:2}},
{text:"Ask for more opinions before changing anything.",traits:{strategy:3,trust:2,emotionalControl:3,leadership:1}},
{text:"Admit publicly that I was wrong.",traits:{morality:2,emotionalControl:3,leadership:2,independence:1}},
{text:"Change the plan but avoid admitting the mistake.",traits:{pragmatism:2,manipulation:2,leadership:2,emotionalControl:3}},
{text:"Keep the original plan because changing it now could create more problems.",traits:{independence:2,pragmatism:2,emotionalControl:2,riskAppetite:-1}}
]},
{
id:25, question:"You discover that one of your closest friends has secretly been communicating with an enemy group. They haven't given them any important information yet. What is your first reaction?",
answers:[
{text:"Confront them privately.",traits:{loyalty:3,empathy:2,trust:2,emotionalControl:2}},
{text:"Secretly investigate before confronting them.",traits:{strategy:3,selfPreservation:2,emotionalControl:3,trust:-1}},
{text:"Tell the group immediately.",traits:{morality:3,leadership:2,trust:-1,courage:2}},
{text:"Pretend I know nothing and use the information against the enemy.",traits:{manipulation:3,strategy:3,pragmatism:3,trust:-3,ruthlessness:1}},
{text:"Assume there's a good reason and ask them what's going on.",traits:{empathy:3,trust:3,loyalty:2,morality:1}}
]},
{
id:26, question:"You have the opportunity to become the unquestioned leader of a large community. Nobody could challenge you. You could probably make the community safer—but you'd also have enormous control over people's lives. What appeals to you most?",
answers:[
{text:"Having the power to protect everyone.",traits:{leadership:3,empathy:2,morality:2,charisma:2}},
{text:"Having the ability to finally make decisions without resistance.",traits:{leadership:3,independence:3,ruthlessness:1,manipulation:1}},
{text:"The opportunity doesn't interest me.",traits:{independence:2,leadership:-2,riskAppetite:-1}},
{text:"I'd accept it, but create rules limiting my own power.",traits:{morality:3,leadership:2,strategy:2,emotionalControl:2}},
{text:"I'd rather control things indirectly than be responsible for everything.",traits:{manipulation:3,strategy:3,leadership:1,charisma:2}}
]},
{
id:27, question:"Your sibling has made a terrible mistake that could get the entire group killed. The group wants them expelled. Your sibling begs you to protect them. What do you do?",
answers:[
{text:"Protect my sibling. Family comes first.",traits:{loyalty:3,empathy:2,morality:-1,pragmatism:-1}},
{text:"Support the group if my sibling genuinely endangered everyone.",traits:{morality:3,pragmatism:2,leadership:2,emotionalControl:3}},
{text:"Find a compromise that keeps them with us under strict conditions.",traits:{loyalty:2,empathy:2,strategy:3,pragmatism:2,hope:1}},
{text:"Help my sibling escape secretly.",traits:{loyalty:3,independence:2,manipulation:2,riskAppetite:2}},
{text:"Let them face the consequences, even if it hurts.",traits:{morality:3,emotionalControl:3,loyalty:-1,pragmatism:2}}
]},
{
id:28, question:"A group that previously attacked you offers an alliance. They have resources your group desperately needs. You don't trust them. What do you do?",
answers:[
{text:"Accept. We need the resources.",traits:{pragmatism:3,riskAppetite:2,trust:1,strategy:1}},
{text:"Refuse. Some enemies shouldn't be trusted.",traits:{selfPreservation:2,trust:-3,independence:2,riskAppetite:-1}},
{text:"Accept temporarily while preparing for betrayal.",traits:{strategy:3,manipulation:2,pragmatism:3,trust:-2,emotionalControl:3}},
{text:"Negotiate strict conditions before agreeing.",traits:{strategy:3,leadership:2,pragmatism:2,trust:0,morality:1}},
{text:"Pretend to accept while secretly gathering information about them.",traits:{manipulation:3,strategy:3,ruthlessness:2,trust:-3,pragmatism:2}}
]},
{
id:29, question:"You discover an escape route from a settlement controlled by a violent group. There is room for only half your people. If you wait for another opportunity, everyone might be trapped. What do you do?",
answers:[
{text:"Leave with whoever can escape first.",traits:{selfPreservation:3,pragmatism:3,loyalty:-1,riskAppetite:1}},
{text:"Refuse to leave unless everyone can come.",traits:{loyalty:3,morality:3,empathy:3,hope:2,riskAppetite:-2}},
{text:"Choose the people most likely to survive outside.",traits:{pragmatism:3,strategy:3,selfPreservation:2,empathy:-1}},
{text:"Stay behind and help the others escape later.",traits:{loyalty:3,courage:3,empathy:2,riskAppetite:2,selfPreservation:-2}},
{text:"Create a distraction so everyone has a chance to escape.",traits:{leadership:3,courage:3,strategy:3,hope:1,riskAppetite:3,loyalty:2}}
]},
{
id:30, question:"Your group is surrounded. What do you do?",
answers:[
{text:"Fight. We may die, but we refuse to surrender.",traits:{courage:3,loyalty:3,independence:2,riskAppetite:3,selfPreservation:-1}},
{text:"Negotiate. Survival is more important than pride.",traits:{pragmatism:3,selfPreservation:3,charisma:2,emotionalControl:3,riskAppetite:-1}},
{text:"Sacrifice a small group so the rest can escape.",traits:{leadership:3,pragmatism:3,strategy:3,ruthlessness:3,morality:-2}},
{text:"Attempt an extremely dangerous escape route.",traits:{courage:3,riskAppetite:3,independence:2,strategy:1,hope:1,selfPreservation:-2}},
{text:"Surrender temporarily and look for an opportunity later.",traits:{pragmatism:3,strategy:3,selfPreservation:2,emotionalControl:3,riskAppetite:-1}}
]}
];

/* ------------------------------------------------------------
   Validation
   ------------------------------------------------------------ */

function validateTWDData() {
    const errors = [];
    const forbidden = ["authority", "humility", "stubbornness"];

    TWD_PERSONALITY_QUESTIONS.forEach(q => {
        if (!q.id || !q.question || !Array.isArray(q.answers) || q.answers.length !== 5)
            errors.push(`Q${q.id}: must have a question and exactly 5 answers.`);

        q.answers.forEach((a, i) => {
            Object.keys(a.traits || {}).forEach(trait => {
                if (!TRAIT_KEYS.includes(trait))
                    errors.push(`Q${q.id} answer ${i + 1}: undefined trait "${trait}".`);
                if (forbidden.includes(trait))
                    errors.push(`Q${q.id} answer ${i + 1}: forbidden trait "${trait}".`);
            });
        });
    });

    Object.entries(TWD_CHARACTERS).forEach(([id, character]) => {
        if (character.scores.length !== TRAIT_KEYS.length)
            errors.push(`${id}: character has ${character.scores.length} scores; expected ${TRAIT_KEYS.length}.`);
    });

    if (TWD_PERSONALITY_QUESTIONS.length !== 30)
        errors.push(`Expected 30 questions; found ${TWD_PERSONALITY_QUESTIONS.length}.`);

    return { valid: errors.length === 0, errors };
}

/* ------------------------------------------------------------
   Personality calculation
   ------------------------------------------------------------ */

function calculatePersonality(answerIndexes) {
    const rawScores = {};
    const maxScores = {};
    const minScores = {};

    TRAIT_KEYS.forEach(trait => {
        rawScores[trait] = 0;
        maxScores[trait] = 0;
        minScores[trait] = 0;
    });

    let answeredQuestions = 0;

    TWD_PERSONALITY_QUESTIONS.forEach(question => {
        const selectedIndex = answerIndexes?.[question.id];

        if (selectedIndex === undefined || selectedIndex === null) return;

        const answer = question.answers[selectedIndex];
        if (!answer) return;

        answeredQuestions++;

        Object.entries(answer.traits || {}).forEach(([trait, value]) => {
            if (!TRAIT_KEYS.includes(trait)) return;
            rawScores[trait] += Number(value) || 0;
        });
    });

    /*
     * Theoretical range is based on every question, treating an
     * absent trait as zero. This prevents traits that appear in only
     * some questions from being artificially advantaged.
     */
    TWD_PERSONALITY_QUESTIONS.forEach(question => {
        TRAIT_KEYS.forEach(trait => {
            const values = question.answers.map(answer => Number(answer.traits?.[trait]) || 0);
            maxScores[trait] += Math.max(...values);
            minScores[trait] += Math.min(...values);
        });
    });

    const profile = {};

    TRAIT_KEYS.forEach(trait => {
        const min = minScores[trait];
        const max = maxScores[trait];
        const raw = rawScores[trait];

        if (max === min) {
            profile[trait] = 65;
            return;
        }

        const normalized = ((raw - min) / (max - min)) * 100;

        /*
         * Calibration:
         * 50 theoretical percentile -> 65 displayed score.
         *
         * A 1.5x spread keeps meaningful differences between users
         * while moving the center toward the ~65 level represented by
         * the character matrix. Final results remain 5–95.
         */
        let score = 65 + ((normalized - 50) * 1.5);

        score = Math.max(5, Math.min(95, score));
        profile[trait] = Math.round(score);
    });

    return {
        profile,
        rawScores,
        minScores,
        maxScores,
        answeredQuestions,
        completionPercent: Math.round((answeredQuestions / TWD_PERSONALITY_QUESTIONS.length) * 100)
    };
}

/* ------------------------------------------------------------
   Character matching
   ------------------------------------------------------------ */

function calculateCharacterMatch(userProfile, character) {
    let difference = 0;
    let weightTotal = 0;

    TRAIT_KEYS.forEach((trait, index) => {
        const userScore = Number(userProfile[trait] ?? 65);
        const characterScore = Number(character.scores[index] ?? 65);
        const weight = TRAIT_WEIGHTS[trait] ?? 1;

        difference += Math.abs(userScore - characterScore) * weight;
        weightTotal += 100 * weight;
    });

    const similarity = 100 - ((difference / weightTotal) * 100);

    return Math.round(Math.max(0, Math.min(100, similarity)));
}

/* ------------------------------------------------------------
   Strongest / lowest traits
   ------------------------------------------------------------ */

function getStrongestTraits(profile, count = 3) {
    return TRAIT_KEYS
        .map((trait, index) => ({
            trait,
            label: TWD_TRAITS[index],
            score: profile[trait]
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
}

function getLowestTraits(profile, count = 3) {
    return TRAIT_KEYS
        .map((trait, index) => ({
            trait,
            label: TWD_TRAITS[index],
            score: profile[trait]
        }))
        .sort((a, b) => a.score - b.score)
        .slice(0, count);
}

/* ------------------------------------------------------------
   Final result
   ------------------------------------------------------------ */

function calculateFinalPersonality(answerIndexes) {
    const personality = calculatePersonality(answerIndexes);

    const results = Object.entries(TWD_CHARACTERS)
        .map(([id, character]) => ({
            id,
            name: character.name,
            image: character.image,
            similarity: calculateCharacterMatch(personality.profile, character)
        }))
        .sort((a, b) => b.similarity - a.similarity);

    const strongestTraits = getStrongestTraits(personality.profile, 3);
    const lowestTraits = getLowestTraits(personality.profile, 3);

    return {
        profile: personality.profile,
        rawScores: personality.rawScores,
        answeredQuestions: personality.answeredQuestions,
        completionPercent: personality.completionPercent,
        results,
        winner: results[0] || null,
        second: results[1] || null,
        third: results[2] || null,
        strongestTraits,
        lowestTraits
    };
}

/* ------------------------------------------------------------
   Completion / answer helpers
   ------------------------------------------------------------ */

function isQuizComplete(answerIndexes) {
    return TWD_PERSONALITY_QUESTIONS.every(q => {
        const index = answerIndexes?.[q.id];
        return Number.isInteger(index) && index >= 0 && index < q.answers.length;
    });
}

function getUnansweredQuestions(answerIndexes) {
    return TWD_PERSONALITY_QUESTIONS
        .filter(q => {
            const index = answerIndexes?.[q.id];
            return !Number.isInteger(index) || index < 0 || index >= q.answers.length;
        })
        .map(q => q.id);
}

function createEmptyTraitScores() {
    const scores = {};
    TRAIT_KEYS.forEach(trait => scores[trait] = 65);
    return scores;
}

/* ------------------------------------------------------------
   Automatic validation on load
   ------------------------------------------------------------ */

const TWD_ENGINE_VALIDATION = validateTWDData();

if (!TWD_ENGINE_VALIDATION.valid) {
    console.error("TWD personality data validation failed:", TWD_ENGINE_VALIDATION.errors);
} else {
    console.log(
        `TWD Personality Engine loaded successfully: ` +
        `${TWD_PERSONALITY_QUESTIONS.length} questions, ` +
        `${Object.keys(TWD_CHARACTERS).length} characters, ` +
        `${TRAIT_KEYS.length} traits.`
    );
}

/*
   Browser/global compatibility:
   These names remain available to existing quiz code.
*/
if (typeof window !== "undefined") {
    Object.assign(window, {
        TRAIT_KEYS,
        TWD_TRAITS,
        TRAIT_WEIGHTS,
        TWD_CHARACTERS,
        TWD_PERSONALITY_QUESTIONS,
        TWD_ENGINE_VALIDATION,
        createEmptyTraitScores,
        calculatePersonality,
        calculateCharacterMatch,
        getStrongestTraits,
        getLowestTraits,
        calculateFinalPersonality,
        isQuizComplete,
        getUnansweredQuestions,
        validateTWDData
    });
}