import { createFileRoute } from "@tanstack/react-router";
import { PageTransition, Reveal } from "@/components/Motion";
import { GlassLink } from "@/components/GlassButton";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Projeto | Tramas Ocultas: Vozes da Vida" },
      {
        name: "description",
        content:
          "Tramas Ocultas: Vozes da Vida não nasceu como livro. Nasceu como exercício: uma palavra, um tema, escuta e escrita, capítulo após capítulo.",
      },
      { property: "og:title", content: "Sobre o Projeto | Tramas Ocultas" },
      {
        property: "og:description",
        content:
          "Apresentação oficial do projeto: processo, nome, objetivo, público e onde encontrar a obra.",
      },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: AboutPage,
});

const steps = [
  {
    n: "01",
    title: "A palavra",
    text: "Escolhida previamente, sozinha, sem contexto. Um único termo como fio, silêncio, casa, voz ou tempo.",
  },
  {
    n: "02",
    title: "O tema",
    text: "A palavra recebe um ângulo de entrada: memória, identidade, tempo, pertencimento, superação.",
  },
  {
    n: "03",
    title: "A escuta",
    text: "Antes de qualquer escrita, um tempo para observar o que o termo carrega de silencioso, o que ele esconde além do dicionário.",
  },
  {
    n: "04",
    title: "A escrita",
    text: "O conceito simples se transforma em história, reflexão ou memória. Nunca uma explicação da palavra: uma tentativa de escutá-la até o fim.",
  },
];

function AboutPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-3 pb-10 pt-28 sm:px-6 sm:pt-36">
        <Reveal>
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-primary sm:text-[0.66rem]">
            Apresentação do projeto
          </p>
          <h1 className="title-gradient mt-4 font-display text-3xl font-semibold sm:text-5xl">
            Tramas Ocultas: Vozes da Vida
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-panel grain relative mt-10 overflow-hidden p-8 sm:p-11">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-primary">
              Sobre o projeto
            </p>
            <p className="reading-body mt-5">
              <span className="text-primary">Tramas Ocultas: Vozes da Vida</span> não nasceu como
              livro. Nasceu como exercício, e continua sendo, capítulo após capítulo.
            </p>
            <p className="reading-body mt-6">
              A proposta é simples de descrever e difícil de cumprir: receber uma única palavra,
              receber um tema que a acompanha, e escrever até que esse ponto de partida mínimo
              revele algo que ainda não tinha sido dito. Antes de cada texto existe apenas isso: um
              termo como fio, silêncio, casa, voz ou tempo, e um recorte para guiar o olhar:
              memória, identidade, tempo, pertencimento, superação.
            </p>
            <p className="reading-body mt-6">
              O resultado é uma coleção de textos que atravessam sentimentos, memórias e
              perspectivas distintas: histórias que existem por baixo do visível, no mesmo lugar
              onde vivem as coisas que sentimos mas raramente nomeamos. Cada capítulo é
              independente, mas todos compartilham essa mesma raiz, a ideia de que uma palavra,
              olhada com atenção suficiente, é sempre maior do que parece.
            </p>
            <p className="reading-body mt-6">
              Esta versão web substitui o formato tradicional de e-book em PDF. Em vez de páginas
              estáticas, a obra ganha profundidade, luz, movimento e som: uma interface em vidro
              líquido, iluminação suave e trilha sonora ambiente que acompanham o tom contemplativo
              dos textos, sem nunca competir com a leitura. O site já está no ar, em constante
              expansão, com novos capítulos sendo publicados aos poucos, cada um pensado como parte
              de uma obra viva, não como um produto fechado.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="glass-panel interactive-panel h-full p-6">
                <span className="font-display text-3xl font-semibold text-primary/70">{s.n}</span>
                <h2 className="mt-4 font-display text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.08}>
          <div className="glass-panel mt-10 p-8 sm:p-11">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-primary">O nome</p>
            <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
              Por que Tramas Ocultas: Vozes da Vida
            </h2>
            <p className="reading-body mt-5">
              O nome carrega, de forma bastante literal, a proposta do projeto inteiro.
            </p>
            <p className="reading-body mt-6">
              “Trama” é o entrelaçamento de fios que formam um tecido, mas também é a estrutura
              escondida de uma narrativa, aquilo que sustenta uma história por dentro, mesmo quando
              o leitor não consegue ver claramente os fios que a compõem. “Oculta” porque essas
              tramas não estão na superfície: elas vivem por baixo do visível, no espaço entre o que
              é dito e o que é apenas sentido. Juntas, as duas palavras descrevem exatamente o que
              cada capítulo tenta fazer, puxar um fio único (a palavra-base) e revelar o tecido
              maior, geralmente invisível, que esse fio sustenta.
            </p>
            <p className="reading-body mt-6">
              O subtítulo, “Vozes da Vida”, completa o sentido: cada capítulo é entendido como uma
              voz distinta, uma perspectiva ou memória que ganha forma através da escrita. Não é uma
              voz só, é um conjunto de vozes, tantas quantas forem as palavras e os temas que ainda
              vão nascer, todas falando sobre a experiência de estar vivo, com suas tensões,
              silêncios e pequenas revelações.
            </p>
            <p className="reading-body mt-6">
              Nenhum capítulo tenta explicar a palavra que o originou; todos tentam escutá-la. É
              esse mesmo espírito que dá nome ao projeto: não expor a trama, mas deixá-la ser
              sentida, e, através dela, dar voz a experiências que, de outra forma, permaneceriam
              ocultas.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="glass-panel mt-10 p-8 sm:p-11">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-primary">Objetivo</p>
            <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
              Palavras simples, experiências de leitura
            </h2>
            <p className="reading-body mt-5">
              O objetivo central de Tramas Ocultas é transformar palavras simples em experiências de
              leitura que ajudem outras pessoas a se reconectar com suas próprias emoções, memórias
              e histórias. Cada capítulo funciona como um convite: ao ler sobre o fio, o silêncio ou
              a casa de alguém, o leitor é levado a pensar sobre o seu próprio fio, o seu próprio
              silêncio, a sua própria casa.
            </p>
            <p className="reading-body mt-6">
              Além do aspecto literário, o projeto tem um objetivo autoral e profissional claro:
              reunir escrita e design em uma única obra, mostrando que texto e interface podem ser
              pensados juntos, como uma experiência só, não um conteúdo de um lado e uma “embalagem”
              visual do outro. É, também, um portfólio vivo: cada capítulo publicado é prova de um
              processo criativo contínuo, disciplinado e coerente, que une identidade visual,
              atmosfera sonora e narrativa em um mesmo projeto autoral.
            </p>
            <p className="reading-body mt-6">
              A médio prazo, o objetivo é expandir a obra, novos capítulos, novas palavras, novos
              temas, mantendo sempre o mesmo compromisso inicial: a palavra vem primeiro, e o texto
              só existe depois de uma escuta genuína.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="glass-panel mt-10 p-8 sm:p-11">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-primary">Público</p>
            <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
              Para quem esta obra conversa
            </h2>
            <p className="reading-body mt-5">
              Tramas Ocultas conversa, antes de tudo, com pessoas que se interessam por leitura
              reflexiva e por escrita autoral, leitores que gostam de textos curtos e densos, mais
              próximos da crônica e da prosa poética do que da narrativa tradicional de enredo
              fechado. É um público que valoriza silêncio, atmosfera e subtexto tanto quanto
              valoriza a própria história.
            </p>
            <p className="reading-body mt-6">
              O projeto também dialoga diretamente com a comunidade de design e criação digital:
              profissionais e curiosos interessados em como um site pode se tornar parte da
              experiência literária, unindo interface, som e tipografia a um projeto editorial
              autoral. Por fim, é um trabalho voltado a quem acompanha{" "}
              <span className="text-primary">@designerandrecmg</span> como criador, seguidores do
              Instagram e de outras redes profissionais que já conhecem o autor pelo design e agora
              podem conhecê-lo também pela escrita.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="glass-panel mt-10 p-8 sm:p-11">
            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-primary">
              Onde encontrar
            </p>
            <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">A obra viva</h2>
            <p className="reading-body mt-5">
              Site:{" "}
              <a
                href="https://tramasocult.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                tramasocult.vercel.app
              </a>
            </p>
            <p className="reading-body mt-4">
              Instagram:{" "}
              <a
                href="https://instagram.com/designerandrecmg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                @designerandrecmg
              </a>
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap gap-3">
            <GlassLink to="/livro">Explorar Capítulos</GlassLink>
            <GlassLink to="/autor" variant="glass">
              Conhecer o autor
            </GlassLink>
          </div>
        </Reveal>
      </div>
    </PageTransition>
  );
}
