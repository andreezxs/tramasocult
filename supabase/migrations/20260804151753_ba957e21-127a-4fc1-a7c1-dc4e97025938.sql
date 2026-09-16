CREATE TABLE public.chapters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  chapter_order integer NOT NULL,
  content text NOT NULL,
  summary text NOT NULL,
  keyword text,
  theme text,
  cover_image text,
  reading_time integer NOT NULL DEFAULT 4,
  published_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.chapters TO anon;
GRANT SELECT ON public.chapters TO authenticated;
GRANT ALL ON public.chapters TO service_role;

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published chapters are publicly readable"
ON public.chapters FOR SELECT
USING (is_published = true);

CREATE INDEX chapters_order_idx ON public.chapters (chapter_order);

INSERT INTO public.chapters (title, slug, chapter_order, keyword, theme, summary, reading_time, content) VALUES
('Algo foi escrito', 'algo-foi-escrito', 1, 'escrita', 'Conexões humanas', 'Sobre os laços que sustentam pessoas mesmo quando ninguém está olhando.', 4,
'Existe um fio que ninguém vê e que, mesmo assim, sustenta tudo.

 'Às vezes, alguma coisa precisa ser escrita antes mesmo de sabermos o que queremos dizer.

Uma palavra aparece no meio do dia. Uma frase insiste enquanto escovamos os dentes. Uma lembrança volta sem ser convidada. Não parece importante, até que percebemos que ela está tentando nos levar a algum lugar.

Escrever, talvez, seja isso: prestar atenção ao que permanece.

Nem tudo nasce para ser publicado, compreendido ou explicado. Algumas coisas só precisam encontrar uma forma de existir fora da cabeça. Um pensamento no papel deixa de ser apenas pensamento. Ganha contorno, peso, possibilidade.

Já escrevi coisas que só entendi depois de terminar. Como se minhas próprias palavras soubessem algo que eu ainda não sabia.

Por isso, quando algo insiste em ser escrito, eu escrevo. Nem sempre para encontrar uma resposta. Às vezes, apenas para descobrir qual era a pergunta.''),
