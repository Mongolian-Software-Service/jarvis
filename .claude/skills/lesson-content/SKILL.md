---
name: lesson-content
description: Write or edit course content for TsStark Academy — a lesson body, an exercise, a quiz, a course description, or a whole module. Use whenever the task is authoring teaching material rather than code: "write a lesson about X", "add a quiz", "the Python module needs three more lessons", or editing seed.sql. Covers the Markdown subset the renderer supports, the house voice in Mongolian, and what makes an exercise worth doing.
---

# Writing a lesson

## The Markdown the renderer supports

`packages/core/src/markdown.ts` is a small parser, not CommonMark. It knows:

````
# ## ###  headings (three levels, rendered as h2/h3/h4)
- and 1.  lists
> quote         a prompt to copy into Claude
> [!IMPORTANT]  on its own first line: a warning box, not a prompt
```lang    fenced code, with the language tag — always give one
`code`  **bold**  *italic*  [text](href)
---  rule
````

Anything else is rendered as plain text. Tables, images, nested lists and HTML
are **not** supported — if a lesson needs one, extend the parser and both
renderers, do not paste HTML into a body.

Fence languages that highlight: `js ts tsx jsx python sql bash css html json`.
Anything else renders as clean monospace, which is fine.

## The voice

Mongolian first — it is the language the content is written in, not translated
into. English bodies are optional and normal to leave empty; the site falls back
and says so.

- Speak to one person. "Одоо өөрийн гараар файл үүсгэе", not "Хэрэглэгч файл
  үүсгэнэ".
- Lead with the thing they can do, not with the definition. Open the browser in
  the first paragraph; explain what HTTP is once they have seen it work.
- **Name the mistake.** Every good paragraph in this course ends up being about
  something that goes wrong: the missing `charset`, `box-sizing`, `hariu.ok`,
  the tab-versus-space. That is what a person remembers.
- Technical terms stay in Latin where the industry uses them — `flexbox`,
  `state`, `props`, `commit`. Do not invent Mongolian for them; do explain them.
- No filler. If a paragraph does not teach, cut it.

Length: 150–400 words of body for a normal lesson. A lesson that needs 800 is
two lessons.

## An exercise that is worth doing

`starter_code` is what they begin from and must **run** — a file with a comment
where the work goes, not a blank. `solution_code` is the finished version, not a
different program. They differ by the thing being taught and nothing else.

## A quiz question that is worth asking

The seed's questions are the model: each one is about a mistake the lesson
warned about, and the wrong answers are things somebody might actually believe.

- 2–4 options, exactly one right.
- `explanation_mn` says _why_, and is shown after answering. It is the second
  half of the teaching, not a consolation.
- Four questions is a quiz. Ten is an exam, and this is not one.
- `correct_index` travels to the browser — the quiz marks itself. Do not write
  questions whose answer must stay secret.

## Where content lives

- **Real courses**: the admin console at `/mn/admin` — the lesson editor has a
  Markdown preview that uses the same renderer as the lesson page.
- **The seed**: `supabase/seed.sql`, upserted by id so it can be re-run. Keep
  the ids in their blocks (`1…` courses, `2…` modules, `3…` lessons, `4…` quiz)
  and keep every course's lesson set honest — a syllabus in the seed is what we
  judge the layout against.

No lorem ipsum, and no English standing in for Mongolian: the point of the seed
is to see true text lengths in the real script.
