import type { Passage } from "../types";

/**
 * PALAVRA — seleção editorial local.
 *
 * Uma passagem por dia, sem comentário. A escolha é temática (pedra, casa,
 * luz, caminho, Reino, silêncio) e deve ser revisada pela editoria.
 *
 * ATENÇÃO EDITORIAL: texto transcrito na tradição Almeida (Revista e
 * Corrigida) como conteúdo provisório do MVP. Antes de publicar:
 *   1. conferir cada versículo com a edição de referência escolhida;
 *   2. confirmar a licença de uso da tradução (ARC/ARA são da SBB).
 */
export const PASSAGES: Passage[] = [
  {
    id: "sl-121",
    reference: "Salmos 121:1-8",
    book: "Salmos",
    chapter: 121,
    verses: [
      { n: 1, text: "Elevo os meus olhos para os montes; de onde me virá o socorro?" },
      { n: 2, text: "O meu socorro vem do Senhor, que fez o céu e a terra." },
      { n: 3, text: "Não deixará vacilar o teu pé; aquele que te guarda não tosquenejará." },
      { n: 4, text: "Eis que não tosquenejará nem dormirá o guarda de Israel." },
      { n: 5, text: "O Senhor é quem te guarda; o Senhor é a tua sombra à tua direita." },
      { n: 6, text: "O sol não te molestará de dia, nem a lua, de noite." },
      { n: 7, text: "O Senhor te guardará de todo mal; ele guardará a tua alma." },
      { n: 8, text: "O Senhor guardará a tua entrada e a tua saída, desde agora e para sempre." },
    ],
  },
  {
    id: "mt-7-24",
    reference: "Mateus 7:24-25",
    book: "Mateus",
    chapter: 7,
    verses: [
      {
        n: 24,
        text: "Todo aquele, pois, que escuta estas minhas palavras e as pratica, assemelhá-lo-ei ao homem prudente, que edificou a sua casa sobre a rocha.",
      },
      {
        n: 25,
        text: "E desceu a chuva, e correram rios, e assopraram ventos, e combateram aquela casa, e não caiu, porque estava edificada sobre a rocha.",
      },
    ],
  },
  {
    id: "lm-3-21",
    reference: "Lamentações 3:21-26",
    book: "Lamentações",
    chapter: 3,
    verses: [
      { n: 21, text: "Disto me recordarei na minha mente; por isso, esperarei." },
      { n: 22, text: "As misericórdias do Senhor são a causa de não sermos consumidos, porque as suas misericórdias não têm fim." },
      { n: 23, text: "Novas são cada manhã; grande é a tua fidelidade." },
      { n: 24, text: "A minha porção é o Senhor, diz a minha alma; portanto, esperarei nele." },
      { n: 25, text: "Bom é o Senhor para os que se atêm a ele, para a alma que o busca." },
      { n: 26, text: "Bom é ter esperança e aguardar em silêncio a salvação do Senhor." },
    ],
  },
  {
    id: "sl-119-105",
    reference: "Salmos 119:105",
    book: "Salmos",
    chapter: 119,
    verses: [{ n: 105, text: "Lâmpada para os meus pés é tua palavra e luz, para o meu caminho." }],
  },
  {
    id: "mt-11-28",
    reference: "Mateus 11:28-30",
    book: "Mateus",
    chapter: 11,
    verses: [
      { n: 28, text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei." },
      {
        n: 29,
        text: "Tomai sobre vós o meu jugo, e aprendei de mim, que sou manso e humilde de coração, e encontrareis descanso para a vossa alma.",
      },
      { n: 30, text: "Porque o meu jugo é suave, e o meu fardo é leve." },
    ],
  },
  {
    id: "jo-14-1",
    reference: "João 14:1-3",
    book: "João",
    chapter: 14,
    verses: [
      { n: 1, text: "Não se turbe o vosso coração; credes em Deus, crede também em mim." },
      {
        n: 2,
        text: "Na casa de meu Pai há muitas moradas; se não fosse assim, eu vo-lo teria dito, pois vou preparar-vos lugar.",
      },
      {
        n: 3,
        text: "E, se eu for e vos preparar lugar, virei outra vez e vos levarei para mim mesmo, para que, onde eu estiver, estejais vós também.",
      },
    ],
  },
  {
    id: "sl-46-10",
    reference: "Salmos 46:10",
    book: "Salmos",
    chapter: 46,
    verses: [{ n: 10, text: "Aquietai-vos e sabei que eu sou Deus; serei exaltado entre as nações; serei exaltado sobre a terra." }],
  },
  {
    id: "is-40-28",
    reference: "Isaías 40:28-31",
    book: "Isaías",
    chapter: 40,
    verses: [
      {
        n: 28,
        text: "Não sabes, não ouviste que o eterno Deus, o Senhor, o Criador dos confins da terra, nem se cansa, nem se fatiga? Não há esquadrinhação do seu entendimento.",
      },
      { n: 29, text: "Dá esforço ao cansado e multiplica as forças ao que não tem nenhum vigor." },
      { n: 30, text: "Os jovens se cansarão e se fatigarão, e os jovens certamente cairão." },
      {
        n: 31,
        text: "Mas os que esperam no Senhor renovarão as suas forças e subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.",
      },
    ],
  },
  {
    id: "mt-6-9",
    reference: "Mateus 6:9-13",
    book: "Mateus",
    chapter: 6,
    verses: [
      { n: 9, text: "Portanto, vós orareis assim: Pai nosso, que estás nos céus, santificado seja o teu nome." },
      { n: 10, text: "Venha o teu Reino. Seja feita a tua vontade, tanto na terra como no céu." },
      { n: 11, text: "O pão nosso de cada dia dá-nos hoje." },
      { n: 12, text: "Perdoa-nos as nossas dívidas, assim como nós perdoamos aos nossos devedores." },
      {
        n: 13,
        text: "E não nos induzas à tentação, mas livra-nos do mal; porque teu é o Reino, e o poder, e a glória, para sempre. Amém!",
      },
    ],
  },
  {
    id: "sl-127-1",
    reference: "Salmos 127:1",
    book: "Salmos",
    chapter: 127,
    verses: [
      {
        n: 1,
        text: "Se o Senhor não edificar a casa, em vão trabalham os que a edificam; se o Senhor não guardar a cidade, em vão vigia a sentinela.",
      },
    ],
  },
  {
    id: "1rs-19-11",
    reference: "1 Reis 19:11-12",
    book: "1 Reis",
    chapter: 19,
    verses: [
      {
        n: 11,
        text: "E ele lhe disse: Sai para fora e põe-te neste monte perante a face do Senhor. E eis que passava o Senhor, como também um grande e forte vento que fendia os montes e quebrava as penhas diante da face do Senhor; porém o Senhor não estava no vento; e, depois do vento, um terremoto; também o Senhor não estava no terremoto;",
      },
      { n: 12, text: "e, depois do terremoto, um fogo; porém também o Senhor não estava no fogo; e, depois do fogo, uma voz mansa e delicada." },
    ],
  },
  {
    id: "pv-3-5",
    reference: "Provérbios 3:5-6",
    book: "Provérbios",
    chapter: 3,
    verses: [
      { n: 5, text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento." },
      { n: 6, text: "Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas." },
    ],
  },
  {
    id: "jo-1-1",
    reference: "João 1:1-5",
    book: "João",
    chapter: 1,
    verses: [
      { n: 1, text: "No princípio, era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus." },
      { n: 2, text: "Ele estava no princípio com Deus." },
      { n: 3, text: "Todas as coisas foram feitas por ele, e sem ele nada do que foi feito se fez." },
      { n: 4, text: "Nele, estava a vida e a vida era a luz dos homens." },
      { n: 5, text: "E a luz resplandece nas trevas, e as trevas não a compreenderam." },
    ],
  },
  {
    id: "1pe-2-4",
    reference: "1 Pedro 2:4-5",
    book: "1 Pedro",
    chapter: 2,
    verses: [
      {
        n: 4,
        text: "E, chegando-vos para ele, a pedra viva, reprovada, na verdade, pelos homens, mas para com Deus eleita e preciosa,",
      },
      {
        n: 5,
        text: "vós também, como pedras vivas, sois edificados casa espiritual e sacerdócio santo, para oferecerdes sacrifícios espirituais, agradáveis a Deus, por Jesus Cristo.",
      },
    ],
  },
  {
    id: "sl-23",
    reference: "Salmos 23:1-6",
    book: "Salmos",
    chapter: 23,
    verses: [
      { n: 1, text: "O Senhor é o meu pastor; nada me faltará." },
      { n: 2, text: "Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas." },
      { n: 3, text: "Refrigera a minha alma; guia-me pelas veredas da justiça, por amor do seu nome." },
      {
        n: 4,
        text: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; a tua vara e o teu cajado me consolam.",
      },
      {
        n: 5,
        text: "Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda.",
      },
      {
        n: 6,
        text: "Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida; e habitarei na Casa do Senhor por longos dias.",
      },
    ],
  },
  {
    id: "ap-3-20",
    reference: "Apocalipse 3:20",
    book: "Apocalipse",
    chapter: 3,
    verses: [
      {
        n: 20,
        text: "Eis que estou à porta e bato; se alguém ouvir a minha voz e abrir a porta, entrarei em sua casa e com ele cearei, e ele, comigo.",
      },
    ],
  },
  {
    id: "fp-4-6",
    reference: "Filipenses 4:6-7",
    book: "Filipenses",
    chapter: 4,
    verses: [
      {
        n: 6,
        text: "Não estejais inquietos por coisa alguma; antes, as vossas petições sejam em tudo conhecidas diante de Deus, pela oração e súplica, com ação de graças.",
      },
      {
        n: 7,
        text: "E a paz de Deus, que excede todo o entendimento, guardará o vosso coração e os vossos sentimentos em Cristo Jesus.",
      },
    ],
  },
  {
    id: "mq-6-8",
    reference: "Miqueias 6:8",
    book: "Miqueias",
    chapter: 6,
    verses: [
      {
        n: 8,
        text: "Ele te declarou, ó homem, o que é bom; e que é o que o Senhor pede de ti, senão que pratiques a justiça, e ames a beneficência, e andes humildemente com o teu Deus?",
      },
    ],
  },
  {
    id: "sl-139-7",
    reference: "Salmos 139:7-10",
    book: "Salmos",
    chapter: 139,
    verses: [
      { n: 7, text: "Para onde me irei do teu Espírito ou para onde fugirei da tua face?" },
      { n: 8, text: "Se subir ao céu, tu aí estás; se fizer no Seol a minha cama, eis que tu ali estás também." },
      { n: 9, text: "Se tomar as asas da alva, se habitar nas extremidades do mar," },
      { n: 10, text: "até ali a tua mão me guiará e a tua destra me susterá." },
    ],
  },
  {
    id: "mt-5-14",
    reference: "Mateus 5:14-16",
    book: "Mateus",
    chapter: 5,
    verses: [
      { n: 14, text: "Vós sois a luz do mundo; não se pode esconder uma cidade edificada sobre um monte;" },
      { n: 15, text: "nem se acende a candeia e se coloca debaixo do alqueire, mas no velador, e dá luz a todos que estão na casa." },
      {
        n: 16,
        text: "Assim resplandeça a vossa luz diante dos homens, para que vejam as vossas boas obras e glorifiquem o vosso Pai, que está nos céus.",
      },
    ],
  },
  {
    id: "is-43-1",
    reference: "Isaías 43:1-2",
    book: "Isaías",
    chapter: 43,
    verses: [
      {
        n: 1,
        text: "Mas, agora, assim diz o Senhor que te criou, ó Jacó, e que te formou, ó Israel: Não temas, porque eu te remi; chamei-te pelo teu nome; tu és meu.",
      },
      {
        n: 2,
        text: "Quando passares pelas águas, estarei contigo, e, quando pelos rios, eles não te submergirão; quando passares pelo fogo, não te queimarás, nem a chama arderá em ti.",
      },
    ],
  },
  {
    id: "sl-62-1",
    reference: "Salmos 62:1-2",
    book: "Salmos",
    chapter: 62,
    verses: [
      { n: 1, text: "A minha alma espera somente em Deus; dele vem a minha salvação." },
      { n: 2, text: "Só ele é a minha rocha e a minha salvação; é a minha defesa; não serei grandemente abalado." },
    ],
  },
  {
    id: "lc-17-20",
    reference: "Lucas 17:20-21",
    book: "Lucas",
    chapter: 17,
    verses: [
      {
        n: 20,
        text: "E, interrogado pelos fariseus sobre quando havia de vir o Reino de Deus, respondeu-lhes e disse: O Reino de Deus não vem com aparência exterior.",
      },
      { n: 21, text: "Nem dirão: Ei-lo aqui! Ou: Ei-lo ali! Porque eis que o Reino de Deus está entre vós." },
    ],
  },
  {
    id: "rm-8-38",
    reference: "Romanos 8:38-39",
    book: "Romanos",
    chapter: 8,
    verses: [
      {
        n: 38,
        text: "Porque estou certo de que nem a morte, nem a vida, nem os anjos, nem os principados, nem as potestades, nem o presente, nem o porvir,",
      },
      {
        n: 39,
        text: "nem a altura, nem a profundidade, nem alguma outra criatura nos poderá separar do amor de Deus, que está em Cristo Jesus, nosso Senhor.",
      },
    ],
  },
  {
    id: "sl-84-10",
    reference: "Salmos 84:10",
    book: "Salmos",
    chapter: 84,
    verses: [
      {
        n: 10,
        text: "Porque vale mais um dia nos teus átrios do que, em outra parte, mil. Preferiria estar à porta da Casa do meu Deus a habitar nas tendas da impiedade.",
      },
    ],
  },
  {
    id: "mt-6-31",
    reference: "Mateus 6:31-34",
    book: "Mateus",
    chapter: 6,
    verses: [
      { n: 31, text: "Não andeis, pois, inquietos, dizendo: Que comeremos ou que beberemos ou com que nos vestiremos?" },
      {
        n: 32,
        text: "(Porque todas essas coisas os gentios procuram.) Decerto, vosso Pai celestial bem sabe que necessitais de todas essas coisas;",
      },
      { n: 33, text: "mas buscai primeiro o Reino de Deus, e a sua justiça, e todas essas coisas vos serão acrescentadas." },
      {
        n: 34,
        text: "Não vos inquieteis, pois, pelo dia de amanhã, porque o dia de amanhã cuidará de si mesmo. Basta a cada dia o seu mal.",
      },
    ],
  },
  {
    id: "js-1-9",
    reference: "Josué 1:9",
    book: "Josué",
    chapter: 1,
    verses: [
      {
        n: 9,
        text: "Não to mandei eu? Esforça-te e tem bom ânimo; não pasmes, nem te espantes, porque o Senhor, teu Deus, é contigo, por onde quer que andares.",
      },
    ],
  },
  {
    id: "2co-4-6",
    reference: "2 Coríntios 4:6-7",
    book: "2 Coríntios",
    chapter: 4,
    verses: [
      {
        n: 6,
        text: "Porque Deus, que disse que das trevas resplandecesse a luz, é quem resplandeceu em nossos corações, para iluminação do conhecimento da glória de Deus, na face de Jesus Cristo.",
      },
      { n: 7, text: "Temos, porém, esse tesouro em vasos de barro, para que a excelência do poder seja de Deus e não de nós." },
    ],
  },
  {
    id: "sl-16-11",
    reference: "Salmos 16:11",
    book: "Salmos",
    chapter: 16,
    verses: [
      {
        n: 11,
        text: "Far-me-ás ver a vereda da vida; na tua presença há abundância de alegrias; à tua mão direita há delícias perpetuamente.",
      },
    ],
  },
  {
    id: "hb-11-1",
    reference: "Hebreus 11:1",
    book: "Hebreus",
    chapter: 11,
    verses: [{ n: 1, text: "Ora, a fé é o firme fundamento das coisas que se esperam e a prova das coisas que se não veem." }],
  },
  {
    id: "is-30-15",
    reference: "Isaías 30:15",
    book: "Isaías",
    chapter: 30,
    verses: [
      {
        n: 15,
        text: "Porque assim diz o Senhor Jeová, o Santo de Israel: Em vos converterdes e em repousardes, estaríeis salvos; no sossego e na confiança, estaria a vossa força, mas não o quisestes.",
      },
    ],
  },
];
