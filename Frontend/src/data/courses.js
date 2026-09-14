export const courses = {
    nursery: {
        id: "nursery",
        title: "Nursery",
        category: "Early Education",
        image: "/assets/img/hero-bg.png",

        description:
            "A joyful and engaging learning environment that helps children develop early literacy, numeracy, communication, creativity, and social skills.",

        type: "single",
    },

    lkg: {
        id: "lkg",
        title: "LKG",
        category: "Early Education",
        image: "/assets/img/lkg.png",

        description:
            "Interactive learning activities designed to build confidence, curiosity, communication skills, and a strong foundation for formal education.",

        type: "single",
    },

    ukg: {
        id: "ukg",
        title: "UKG",
        category: "Primary Foundation",
        image: "/assets/img/ukg.png",

        description:
            "A stimulating environment focused on foundational concepts, language development, creativity, numbers, and readiness for primary school.",

        type: "single",
    },

    primary: {
        id: "primary",
        title: "Primary Classes (1–5)",
        category: "Primary School",
        image: "/assets/img/primary.png",

        description:
            "Strong foundations in languages, mathematics, environmental studies, science, creativity, and essential life skills.",

        type: "group",

        classes: [
            {
                id: "1",
                title: "Class 1",
                image: "/assets/img/primary.png",
            },
            {
                id: "2",
                title: "Class 2",
                image: "/assets/img/primary.png",
            },
            {
                id: "3",
                title: "Class 3",
                image: "/assets/img/primary.png",
            },
            {
                id: "4",
                title: "Class 4",
                image: "/assets/img/primary.png",
            },
            {
                id: "5",
                title: "Class 5",
                image: "/assets/img/primary.png",
            },
        ],
    },

    middle: {
        id: "middle",
        title: "Middle School (6–8)",
        category: "Middle School",
        image: "/assets/img/middle.png",

        description:
            "Concept-based learning that develops analytical thinking, problem-solving abilities, scientific curiosity, and academic confidence.",

        type: "group",

        classes: [
            {
                id: "6",
                title: "Class 6",
                image: "/assets/img/middle.png",
            },
            {
                id: "7",
                title: "Class 7",
                image: "/assets/img/middle.png",
            },
            {
                id: "8",
                title: "Class 8",
                image: "/assets/img/middle.png",
            },
        ],
    },

    secondary: {
        id: "secondary",
        title: "Secondary Classes (9–10)",
        category: "Secondary Education",
        image: "/assets/img/secondary.png",

        description:
            "Focused academic preparation with strong subject knowledge, regular assessment, practical learning, and examination preparation.",

        type: "group",

        classes: [
            {
                id: "9",
                title: "Class 9",
                image: "/assets/img/secondary.png",
            },
            {
                id: "10",
                title: "Class 10",
                image: "/assets/img/secondary.png",
            },
        ],
    },

    pcm: {
        id: "pcm",
        title: "Science – PCM",
        category: "Senior Secondary",
        image: "/assets/img/pcm1.png",
        type: "single",
    },

    pcb: {
        id: "pcb",
        title: "Science – PCB",
        category: "Senior Secondary",
        image: "/assets/img/pcb.png",
        type: "single",
    },

    commerce: {
        id: "commerce",
        title: "Commerce",
        category: "Senior Secondary",
        image: "/assets/img/commerce.png",
        type: "single",
    },
};