export const marketing = {
  hero: {
    badgeLabel: "New",
    badgeText: "The first course is free, in full",
    kicker: "Learn to code online",
    title: "The shortest way to start writing code",
    deck:
      "In Mongolian, from the beginning. Watch, write the code yourself, and see it run in your own browser.",
    primary: "Browse courses",
    secondary: "Start with the free course",
  },
  showcase: {
    lessonKicker: "Exercise · 16 minutes",
    lessonTitle: "Layout with flexbox",
    lessonBody:
      "Putting two things side by side, centring one, or pushing them apart — all of it is flexbox.",
    done: "Done",
  },
  tech: {
    title: "Technology",
    note: "The technologies people are actually hired for.",
  },
  stats: {
    courses: "courses",
    lessons: "lessons",
    hours: "hours of material",
  },
  tracks: {
    title: "What you will build",
    items: [
      {
        title: "Your own website",
        body:
          "Without losing weeks writing every line by hand. Learn the tools that already exist, assemble your site the short way, and put it on the internet.",
      },
      {
        title: "A phone app",
        body:
          "One app that runs on iOS and Android. Write it once and ship it to both — screens, data, notifications, and getting it into the stores.",
      },
      {
        title: "2D and 3D games",
        body:
          "Start with movement, collisions and a score in 2D, then move into 3D space, cameras and lighting. Your game runs in the browser.",
      },
      {
        title: "Free extra lessons",
        body:
          "Using AI to support a business: automating work that repeats, making hiring less of a grind, and handing the daily manual jobs to a machine. Free to every student.",
      },
    ],
    demo: {
      free: "Free",
      aiPrompt: "Screen the 40 applications we got and rank them",
      aiSteps: ["Read and parse each one", "Rank against the criteria", "Send the replies"],
    },
  },
  courses: {
    title: "Courses",
    note: "From first steps to advanced",
  },
  about: {
    kicker: "About",
    title: "A coding school that teaches in Mongolian",
    deck:
      "Not knowing English should not be what stops someone learning to code. Jarvis is a curriculum written in Mongolian from the start, built around exercises rather than lectures.",
    story: {
      title: "Why we started it",
      body: [
        "Plenty of people in Mongolia want to learn to code, and the Mongolian-language material is scattered and usually out of date. The rest is in English — which is fine, unless you are meeting an idea for the first time in a language you are still learning.",
        "So instead of translating, we write in Mongolian. Which technical terms stay in English is decided lesson by lesson: the words you type into an editor keep their English spelling, and everything explaining them is Mongolian.",
      ],
    },
    principles: {
      title: "What we believe",
      items: [
        {
          title: "You learn by typing",
          body:
            "Every lesson has an exercise you write yourself. Following a video is not the same as making the code run, and the exercise is the only thing that closes the gap between them.",
        },
        {
          title: "Small steps, one order",
          body:
            "Each course runs start to finish along a single path. You never have to work out what to study next — the next lesson is already there.",
        },
        {
          title: "Something an employer can open",
          body:
            "Every course ends in a project you can hold. A working link is worth more in an interview than a certificate.",
        },
      ],
    },
    audience: {
      title: "Who it is for",
      items: [
        "Complete beginners, starting from nothing",
        "People in work who are thinking about changing career",
        "Students turning a university course into something practical",
      ],
    },
    cta: {
      title: "Which course should you start with?",
      body: "The first one is free in full, so you can find out whether this suits you before paying anything.",
      action: "Browse courses",
    },
  },
  contact: {
    kicker: "Contact",
    title: "Something you want to ask?",
    deck:
      "Course content, payment, a technical problem — the same small team answers all of them. Pick whichever channel is easiest for you.",
    channels: {
      email: {
        label: "Email",
        note: "For longer questions, receipts and partnerships.",
      },
      phone: {
        label: "Phone",
        note: "Weekdays, 10:00–18:00.",
      },
      facebook: {
        label: "Facebook",
        note: "Usually the fastest reply.",
      },
      instagram: {
        label: "Instagram",
        note: "New courses, and work our students have made.",
      },
    },
    response: {
      title: "When you will hear back",
      body:
        "Usually within one working day. Anything sent over the weekend is answered on Monday.",
    },
    support: {
      title: "Stuck inside a course?",
      body:
        "If an exercise will not run, or a course you paid for has not opened, include the lesson name and the email address you signed up with. With those two things we can find it straight away.",
    },
  },
  cta: {
    title: "Start today?",
    body: "Signing up is free, and the first course is open in full.",
    action: "Create an account",
  },
} as const;
