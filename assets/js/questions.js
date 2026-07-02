/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Reusable dynamic data structure for the chemistry lesson.
// Exact 39 source questions from الفصل الأول - القسم الأول - V3.
const examData = {
  chapterName: "الفصل الأول",
  lessonName: "القسم الأول",
  sourceInfo: "39 سؤالاً",
  totalQuestions: 39,
  lessonStorageId: "chemistry-chapter-1-section-1-v3",
  questions: [
    {
      id: 1,
      type: "theory",
      metadata: {
        page: "1",
        occurrence: "2014/1 (أسئلة النازحين) | 2018/2 (تطبيقي)"
      },
      text: "عدّد أهم الظواهر التي يفسرها علم الثرموداينمك.",
      modelAnswer: {
        theoryText: "1) سبب حدوث التفاعلات الكيميائية.<br>2) التنبؤ بحدوث التغيرات الكيميائية والفيزيائية عندما توجد مادة أو أكثر تحت ظروف معينة.<br>3) حدوث بعض التفاعلات تلقائياً وأخرى لا تحدث أبداً بشكل تلقائي عند نفس الظروف.<br>4) سبب حدوث الطاقة المصاحبة للتفاعلات الكيميائية، سواء في التفاعلات نفسها أو في الوسط المحيط بها."
      }
    },
    {
      id: 2,
      type: "theory",
      metadata: {
        page: "1",
        occurrence: "2024/2 | 2024/3 | 2024/3 (محاولات)"
      },
      text: "يفسر علم الثرموداينمك ظواهر مهمة عديدة، عدّدها.",
      modelAnswer: {
        theoryText: "1) سبب حدوث التفاعلات الكيميائية.<br>2) التنبؤ بحدوث التغيرات الكيميائية والفيزيائية عندما توجد مادة أو أكثر تحت ظروف معينة.<br>3) حدوث بعض التفاعلات تلقائياً وأخرى لا تحدث أبداً بشكل تلقائي عند نفس الظروف.<br>4) سبب حدوث الطاقة المصاحبة للتفاعلات الكيميائية، سواء في التفاعلات نفسها أو في الوسط المحيط بها."
      }
    },
    {
      id: 3,
      type: "theory",
      metadata: {
        page: "1",
        occurrence: "2019/تمهيدي (تطبيقي) | 2023/1 (أحيائي)"
      },
      text: "عرّف القانون الأول للثرموداينمك.",
      modelAnswer: {
        theoryText: "الطاقة لا تفنى ولا تستحدث من العدم، ولكن يمكن تحويلها من شكل إلى آخر."
      }
    },
    {
      id: 4,
      type: "theory",
      metadata: {
        page: "1",
        occurrence: "2022/أحيائي (تطبيقي) | 2023/1 (تطبيقي)"
      },
      text: "الطاقة الكامنة هي ............، والطاقة الحركية هي ............",
      modelAnswer: {
        theoryText: "الطاقة الكامنة: تشمل الطاقة الكيميائية المخزونة في جميع أنواع المواد وجميع أنواع الوقود.<br>الطاقة الحركية: تشمل طاقة جميع الأجسام المتحركة، مثل الجزيئات والماء المتحرك وكذلك السيارات والطائرات والصواريخ وغيرها."
      }
    },
    {
      id: 5,
      type: "theory",
      metadata: {
        page: "1",
        occurrence: "2013/2 (تمهيدي) | 2017/تمهيدي (تطبيقي) | 2023/2 (أحيائي)"
      },
      text: "عرّف النظام المفتوح.",
      modelAnswer: {
        theoryText: "هو النظام الذي تسمح حدوده بتبادل مادة النظام وطاقته مع المحيط، مثل إناء معدني مفتوح يحتوي ماءً مغلياً."
      }
    },
    {
      id: 6,
      type: "theory",
      metadata: {
        page: "1",
        occurrence: "2013/1"
      },
      text: "عرّف النظام المغلق.",
      modelAnswer: {
        theoryText: "هو النظام الذي تسمح حدوده بتبادل الطاقة فقط ولا تسمح بتغيير كمية مادة النظام، مثل إناء معدني مغلق يحتوي ماءً مغلياً."
      }
    },
    {
      id: 7,
      type: "theory",
      metadata: {
        page: "1",
        occurrence: "2016/1 | 2017/1 (خارج القطر) | 2017/2 | 2018/3 | 2020/2"
      },
      text: "عرّف النظام المعزول.",
      modelAnswer: {
        theoryText: "هو النظام الذي لا تسمح حدوده بتبادل الطاقة ولا المادة مع المحيط."
      }
    },
    {
      id: 8,
      type: "theory",
      metadata: {
        page: "1",
        occurrence: "2014/1 (أسئلة خارج القطر) | 2017/3"
      },
      text: "إذا كانت حدود النظام تسمح بتبادل الطاقة فقط ولا تسمح بتغيير كمية مادة النظام يسمى نظاماً:",
      choices: ["مفتوحاً", "معزولاً", "مغلقاً"],
      modelAnswer: {
        theoryText: "مغلقاً."
      }
    },
    {
      id: 9,
      type: "theory",
      metadata: {
        page: "1",
        occurrence: "2014/1 | 2014/2"
      },
      text: "إذا كانت حدود النظام لا تسمح بتبادل المادة والطاقة مع المحيط يدعى النظام:",
      choices: ["المغلق", "المعزول", "المفتوح"],
      modelAnswer: {
        theoryText: "المعزول."
      }
    },
    {
      id: 10,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2015/2 | 2023/3 (تطبيقي)"
      },
      text: "النظام المعزول هو ذلك النظام الذي لا تسمح حدوده بتبادل ............ و............ مع المحيط.",
      modelAnswer: {
        theoryText: "مادته وطاقته."
      }
    },
    {
      id: 11,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2020/1 | 2023/3 (تطبيقي)"
      },
      text: "خواص النظام هي المتغيرات الفيزيائية للنظام التي يمكن ملاحظتها أو قياسها مثل ............ أو ............ الموجودة في النظام، والحالة الفيزيائية للمواد والحجم والضغط ودرجة الحرارة.",
      modelAnswer: {
        theoryText: "عدد المولات أو المواد."
      }
    },
    {
      id: 12,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2022/2 (تطبيقي)"
      },
      text: "يقسم النظام إلى ثلاثة أنواع هي ............ و............ و............",
      modelAnswer: {
        theoryText: "المفتوح والمغلق والمعزول."
      }
    },
    {
      id: 13,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2024/3"
      },
      text: "قارن بين النظام المفتوح والنظام المغلق.",
      modelAnswer: {
        theoryText: "النظام المفتوح:<br>هو النظام الذي تكون فيه الحدود بين النظام والمحيط تسمح بتبادل مادة النظام وطاقته، مثل إناء معدني مفتوح يحتوي ماءً مغلياً.<br><br>النظام المغلق:<br>هو النظام الذي تكون فيه الحدود بين النظام والمحيط تسمح بتبادل الطاقة فقط ولا تسمح بتغيير كمية مادة النظام، مثل إناء معدني مغلق يحتوي ماءً مغلياً."
      }
    },
    {
      id: 14,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2017/1 (تطبيقي) | 2019/تمهيدي | 2023/2 (تطبيقي)"
      },
      text: "ما الفرق بين النظام المفتوح والنظام المغلق؟",
      modelAnswer: {
        theoryText: "النظام المفتوح:<br>هو النظام الذي تكون فيه الحدود بين النظام والمحيط تسمح بتبادل مادة النظام وطاقته، مثل إناء معدني مفتوح يحتوي ماءً مغلياً.<br><br>النظام المغلق:<br>هو النظام الذي تكون فيه الحدود بين النظام والمحيط تسمح بتبادل الطاقة فقط ولا تسمح بتغيير كمية مادة النظام، مثل إناء معدني مغلق يحتوي ماءً مغلياً."
      }
    },
    {
      id: 15,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2018/تمهيدي"
      },
      text: "عدّد أنواع النظام مع مثال لكل نوع.",
      modelAnswer: {
        theoryText: "1) النظام المفتوح: مثل إناء معدني مفتوح يحتوي ماءً مغلياً.<br>2) النظام المغلق: مثل إناء معدني مغلق يحتوي ماءً مغلياً.<br>3) النظام المعزول: مثل الترموس."
      }
    },
    {
      id: 16,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2022/تمهيدي (تطبيقي)"
      },
      text: "ما أقسام النظام؟ عدّدها فقط.",
      modelAnswer: {
        theoryText: "1) النظام المفتوح.<br>2) النظام المغلق.<br>3) النظام المعزول."
      }
    },
    {
      id: 17,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2015/ت (خارج القطر) | 2017/2 (خارج القطر) | 2022/1 (تطبيقي) | 2023/ت (تطبيقي)"
      },
      text: "عرّف السعة الحرارية.",
      modelAnswer: {
        theoryText: "هي كمية الحرارة اللازمة لرفع درجة حرارة كتلة m مقدرة بالغرام من أي مادة درجة سليزية واحدة، ووحدتها \\( \\mathrm{J/^\\circ C} \\)."
      }
    },
    {
      id: 18,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2014/1 | 2018/1 (تطبيقي) | 2022/2 (تطبيقي)"
      },
      text: "عرّف الحرارة النوعية.",
      modelAnswer: {
        theoryText: "هي كمية الحرارة اللازمة لرفع درجة حرارة كتلة غرام واحد (1 g) من أي مادة درجة سليزية واحدة، ووحدتها \\( \\mathrm{J/(g\\cdot^\\circ C)} \\)."
      }
    },
    {
      id: 19,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2017/1 (أسئلة الموصل) | 2018/تمهيدي | 2018/2 (تطبيقي) | 2020/تمهيدي (تطبيقي)"
      },
      text: "ما الفرق بين الحرارة النوعية والسعة الحرارية؟ وما هي وحدات هاتين الكميتين؟",
      modelAnswer: {
        theoryText: "الحرارة النوعية:<br>1) كمية الحرارة اللازمة لرفع درجة حرارة كتلة غرام واحد من أي مادة درجة سليزية واحدة.<br>2) تعتبر من الخواص المركزة.<br>3) وحدتها \\( \\mathrm{J/(g\\cdot^\\circ C)} \\).<br><br>السعة الحرارية:<br>1) كمية الحرارة اللازمة لرفع درجة حرارة كتلة مقدرة بالغرام من أي مادة درجة سليزية واحدة.<br>2) تعتبر من الخواص الشاملة.<br>3) وحدتها \\( \\mathrm{J/^\\circ C} \\)."
      }
    },
    {
      id: 20,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2022/2 (أحيائي)"
      },
      text: "ما الفرق بين السعة الحرارية والحرارة النوعية؟ وما وحدات كل منهما؟",
      modelAnswer: {
        theoryText: "السعة الحرارية:<br>1) كمية الحرارة اللازمة لرفع درجة حرارة كتلة مقدرة بالغرام من أي مادة درجة سليزية واحدة.<br>2) تعتبر من الخواص الشاملة.<br>3) وحدتها \\( \\mathrm{J/^\\circ C} \\).<br><br>الحرارة النوعية:<br>1) كمية الحرارة اللازمة لرفع درجة حرارة كتلة غرام واحد من أي مادة درجة سليزية واحدة.<br>2) تعتبر من الخواص المركزة.<br>3) وحدتها \\( \\mathrm{J/(g\\cdot^\\circ C)} \\)."
      }
    },
    {
      id: 21,
      type: "theory",
      metadata: {
        page: "2",
        occurrence: "2024/2 (محاولات)"
      },
      text: "قارن بين الحرارة النوعية والسعة الحرارية مع كتابة العلاقة الرياضية التي تربط بينهما.",
      modelAnswer: {
        theoryText: "الحرارة النوعية:<br>1) كمية الحرارة اللازمة لرفع درجة حرارة كتلة غرام واحد من أي مادة درجة سليزية واحدة.<br>2) تعتبر من الخواص المركزة.<br>3) وحدتها \\( \\mathrm{J/(g\\cdot^\\circ C)} \\).<br><br>السعة الحرارية:<br>1) كمية الحرارة اللازمة لرفع درجة حرارة كتلة مقدرة بالغرام من أي مادة درجة سليزية واحدة.<br>2) تعتبر من الخواص الشاملة.<br>3) وحدتها \\( \\mathrm{J/^\\circ C} \\).<br><br>العلاقة التي تربط بينهما:<br><div class='equation-block'>\\( C = S \\times m \\)</div>"
      }
    },
    {
      id: 22,
      type: "theory",
      metadata: {
        page: "3",
        occurrence: "2014/1 (أسئلة النازحين)"
      },
      text: "إن كمية الحرارة اللازمة لرفع درجة حرارة كتلة غرام واحد من مادة درجة سليزية هي:",
      choices: ["الحرارة المنبعثة", "السعة الحرارية", "الحرارة النوعية"],
      modelAnswer: {
        theoryText: "الحرارة النوعية."
      }
    },
    {
      id: 23,
      type: "theory",
      metadata: {
        page: "3",
        occurrence: "2025/تمهيدي"
      },
      text: "الحرارة النوعية من الخواص ............، وذلك لأنها ............ على كمية المادة الموجودة في النظام.",
      modelAnswer: {
        theoryText: "المركزة، لا تعتمد."
      }
    },
    {
      id: 24,
      type: "theory",
      metadata: {
        page: "3",
        occurrence: "2025/2"
      },
      text: "الحرارة النوعية من الخواص ............، بينما السعة الحرارية فإنها من الخواص ............",
      modelAnswer: {
        theoryText: "المركزة، الشاملة."
      }
    },
    {
      id: 25,
      type: "calculation",
      metadata: {
        page: "3",
        occurrence: "2016/2 (أسئلة خارج القطر)"
      },
      text: "تغيرت درجة حرارة قطعة من المغنيسيوم كتلتها 10 g من 25 °C إلى 45 °C مع اكتساب حرارة مقدارها 205 J. احسب الحرارة النوعية للمغنيسيوم.",
      modelAnswer: {
        given: [
          "\\( m = 10\\,\\mathrm{g} \\)",
          "\\( T_i = 25\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 45\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 205\\,\\mathrm{J} \\)"
        ],
        law: "\\( q = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( \\Delta T = T_f - T_i = 45 - 25 = 20\\,^\\circ\\mathrm{C} \\)",
          "\\( 205 = S \\times 10 \\times 20 \\)"
        ],
        steps: [
          "\\( S = \\frac{205}{10 \\times 20} \\)",
          "\\( S = \\frac{205}{200} \\)"
        ],
        finalAnswer: "\\( S = 1.025\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
      }
    },
    {
      id: 26,
      type: "calculation",
      metadata: {
        page: "3",
        occurrence: "2013/تمهيدي"
      },
      text: "ما مقدار الحرارة الناتجة من تسخين قطعة من الحديد كتلتها 870 g من 5 °C إلى 95 °C، علماً أن الحرارة النوعية للحديد تساوي 0.45 J/(g·°C)؟",
      modelAnswer: {
        given: [
          "\\( m = 870\\,\\mathrm{g} \\)",
          "\\( T_i = 5\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 95\\,^\\circ\\mathrm{C} \\)",
          "\\( S = 0.45\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
        ],
        law: "\\( q\\,\\mathrm{(J)} = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( \\Delta T = T_f - T_i = 95 - 5 = 90\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 0.45 \\times 870 \\times 90 \\)"
        ],
        steps: [
          "\\( q = 35235\\,\\mathrm{J} \\)",
          "\\( q\\,\\mathrm{(kJ)} = \\frac{35235}{1000} \\)"
        ],
        finalAnswer: "\\( q = 35.2\\,\\mathrm{kJ} \\)"
      }
    },
    {
      id: 27,
      type: "calculation",
      metadata: {
        page: "4",
        occurrence: "2014/1 (أسئلة النازحين)"
      },
      text: "احسب الحرارة النوعية للزئبق عند تبريد قطعة مقدارها 0.35 kg من 77 °C إلى 12 °C، إذا علمت أن كمية الحرارة المنبعثة تساوي −3185 J.",
      modelAnswer: {
        given: [
          "\\( m = 0.35\\,\\mathrm{kg} \\)",
          "\\( T_i = 77\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 12\\,^\\circ\\mathrm{C} \\)",
          "\\( q = -3185\\,\\mathrm{J} \\)"
        ],
        law: "\\( q = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( m\\,\\mathrm{(g)} = 0.35 \\times 1000 = 350\\,\\mathrm{g} \\)",
          "\\( \\Delta T = T_f - T_i = 12 - 77 = -65\\,^\\circ\\mathrm{C} \\)",
          "\\( -3185 = S \\times 350 \\times (-65) \\)"
        ],
        steps: [
          "\\( S = \\frac{-3185}{350 \\times (-65)} \\)",
          "\\( S = \\frac{-3185}{-22750} \\)"
        ],
        finalAnswer: "\\( S = 0.14\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
      }
    },
    {
      id: 28,
      type: "calculation",
      metadata: {
        page: "4",
        occurrence: "2017/2"
      },
      text: "سخنت عينة من مادة مجهولة كتلتها 150 g، فتغيرت درجة الحرارة بمقدار 20 °C، مما أدى إلى امتصاص حرارة مقدارها 5400 J. احسب الحرارة النوعية لهذه المادة.",
      modelAnswer: {
        given: [
          "\\( m = 150\\,\\mathrm{g} \\)",
          "\\( \\Delta T = 20\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 5400\\,\\mathrm{J} \\)"
        ],
        law: "\\( q\\,\\mathrm{(J)} = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( 5400 = S \\times 150 \\times 20 \\)"
        ],
        steps: [
          "\\( 5400 = 3000 \\times S \\)",
          "\\( S = \\frac{5400}{3000} \\)"
        ],
        finalAnswer: "\\( S = 1.8\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
      }
    },
    {
      id: 29,
      type: "calculation",
      metadata: {
        page: "4",
        occurrence: "2013 (خارج القطر)"
      },
      text: "تغيرت درجة حرارة قطعة من المغنيسيوم كتلتها 10 g من 25 °C إلى 45 °C مع اكتساب حرارة مقدارها 114 J. احسب الحرارة النوعية لقطعة المغنيسيوم.",
      modelAnswer: {
        given: [
          "\\( m = 10\\,\\mathrm{g} \\)",
          "\\( T_i = 25\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 45\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 114\\,\\mathrm{J} \\)"
        ],
        law: "\\( q\\,\\mathrm{(J)} = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( \\Delta T = T_f - T_i = 45 - 25 = 20\\,^\\circ\\mathrm{C} \\)",
          "\\( 114 = S \\times 10 \\times 20 \\)"
        ],
        steps: [
          "\\( S = \\frac{114}{10 \\times 20} \\)",
          "\\( S = \\frac{114}{200} \\)"
        ],
        finalAnswer: "\\( S = 0.57\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
      }
    },
    {
      id: 30,
      type: "calculation",
      metadata: {
        page: "5",
        occurrence: "2018/تمهيدي"
      },
      text: "تغيرت درجة حرارة قطعة من المغنيسيوم كتلتها 15 g من 20 °C إلى 33.3 °C مع اكتسابها حرارة مقدارها 205 J. احسب الحرارة النوعية للمغنيسيوم.",
      modelAnswer: {
        given: [
          "\\( m = 15\\,\\mathrm{g} \\)",
          "\\( T_i = 20\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 33.3\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 205\\,\\mathrm{J} \\)"
        ],
        law: "\\( q\\,\\mathrm{(J)} = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( \\Delta T = T_f - T_i = 33.3 - 20 = 13.3\\,^\\circ\\mathrm{C} \\)",
          "\\( 205 = S \\times 15 \\times 13.3 \\)"
        ],
        steps: [
          "\\( S = \\frac{205}{15 \\times 13.3} \\)",
          "\\( S = \\frac{205}{199.5} \\)"
        ],
        finalAnswer: "\\( S = 1.027\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
      }
    },
    {
      id: 31,
      type: "calculation",
      metadata: {
        page: "5",
        occurrence: "2019/3 (تطبيقي)"
      },
      text: "سخنت عينة من مادة مجهولة كتلتها 100 g من درجة حرارة 25 °C إلى 55 °C، مما أدى إلى امتصاص حرارة مقدارها 6300 J. احسب الحرارة النوعية لهذه المادة.",
      modelAnswer: {
        given: [
          "\\( m = 100\\,\\mathrm{g} \\)",
          "\\( T_i = 25\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 55\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 6300\\,\\mathrm{J} \\)"
        ],
        law: "\\( q\\,\\mathrm{(J)} = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( \\Delta T = T_f - T_i = 55 - 25 = 30\\,^\\circ\\mathrm{C} \\)",
          "\\( 6300 = S \\times 100 \\times 30 \\)"
        ],
        steps: [
          "\\( 6300 = 3000 \\times S \\)",
          "\\( S = \\frac{6300}{3000} \\)"
        ],
        finalAnswer: "\\( S = 2.1\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
      }
    },
    {
      id: 32,
      type: "calculation",
      metadata: {
        page: "5",
        occurrence: "2018/تمهيدي (تطبيقي)"
      },
      text: "احسب كمية الحرارة المنبعثة بوحدات kJ من 350 g زئبق عند تبريدها من 70 °C إلى 20 °C، إذا علمت أن الحرارة النوعية للزئبق تساوي 0.14 J/(g·°C).",
      modelAnswer: {
        given: [
          "\\( m = 350\\,\\mathrm{g} \\)",
          "\\( T_i = 70\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 20\\,^\\circ\\mathrm{C} \\)",
          "\\( S = 0.14\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
        ],
        law: "\\( q\\,\\mathrm{(J)} = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( \\Delta T = T_f - T_i = 20 - 70 = -50\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 0.14 \\times 350 \\times (-50) \\)"
        ],
        steps: [
          "\\( q = -2450\\,\\mathrm{J} \\)",
          "\\( q\\,\\mathrm{(kJ)} = \\frac{-2450}{1000} \\)"
        ],
        finalAnswer: "\\( q = -2.45\\,\\mathrm{kJ} \\)"
      }
    },
    {
      id: 33,
      type: "calculation",
      metadata: {
        page: "5",
        occurrence: "2020/تمهيدي (أحيائي)"
      },
      text: "تم رفع درجة حرارة 32 g من الإيثانول من 25 °C إلى 83 °C. احسب كمية الحرارة الممتصة بواسطة الإيثانول إذا علمت أن الحرارة النوعية للإيثانول تساوي 2.44 J/(g·°C).",
      modelAnswer: {
        given: [
          "\\( m = 32\\,\\mathrm{g} \\)",
          "\\( T_i = 25\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 83\\,^\\circ\\mathrm{C} \\)",
          "\\( S = 2.44\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
        ],
        law: "\\( q\\,\\mathrm{(J)} = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( \\Delta T = T_f - T_i = 83 - 25 = 58\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 2.44 \\times 32 \\times 58 \\)"
        ],
        steps: [
          "\\( q = 78.08 \\times 58 \\)"
        ],
        finalAnswer: "\\( q = 4528.64\\,\\mathrm{J} \\)"
      }
    },
    {
      id: 34,
      type: "calculation",
      metadata: {
        page: "5",
        occurrence: "2019/3"
      },
      text: "احسب كمية الحرارة المنبعثة بوحدات kJ من 350 g زئبق عند تبريدها من 80 °C إلى 15 °C، إذا علمت أن الحرارة النوعية للزئبق تساوي 0.14 J/(g·°C).",
      modelAnswer: {
        given: [
          "\\( m = 350\\,\\mathrm{g} \\)",
          "\\( T_i = 80\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 15\\,^\\circ\\mathrm{C} \\)",
          "\\( S = 0.14\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
        ],
        law: "\\( q = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( \\Delta T = T_f - T_i = 15 - 80 = -65\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 0.14 \\times 350 \\times (-65) \\)"
        ],
        steps: [
          "\\( q = -3185\\,\\mathrm{J} \\)",
          "\\( q\\,\\mathrm{(kJ)} = \\frac{-3185}{1000} \\)"
        ],
        finalAnswer: "\\( q = -3.185\\,\\mathrm{kJ} \\)"
      }
    },
    {
      id: 35,
      type: "calculation",
      metadata: {
        page: "6",
        occurrence: "2021/1 (تطبيقي)"
      },
      text: "سخنت قطعة من الحديد كتلتها 550 g فتغيرت درجة حرارتها بمقدار 80 °C. ما مقدار الحرارة الناتجة نتيجة التسخين؟ علماً أن الحرارة النوعية للحديد تساوي 0.45 J/(g·°C).",
      modelAnswer: {
        given: [
          "\\( m = 550\\,\\mathrm{g} \\)",
          "\\( \\Delta T = 80\\,^\\circ\\mathrm{C} \\)",
          "\\( S = 0.45\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
        ],
        law: "\\( q = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( q = 0.45 \\times 550 \\times 80 \\)"
        ],
        steps: [
          "\\( q = 247.5 \\times 80 \\)"
        ],
        finalAnswer: "\\( q = 19800\\,\\mathrm{J} \\)"
      }
    },
    {
      id: 36,
      type: "calculation",
      metadata: {
        page: "6",
        occurrence: "2020/1 (تطبيقي)"
      },
      text: "احسب كمية الحرارة المنبعثة بوحدات kJ من 350 g زئبق عند تبريدها من 77 °C إلى 12 °C، علماً أن الحرارة النوعية للزئبق تساوي 0.14 J/(g·°C).",
      modelAnswer: {
        given: [
          "\\( m = 350\\,\\mathrm{g} \\)",
          "\\( T_i = 77\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 12\\,^\\circ\\mathrm{C} \\)",
          "\\( S = 0.14\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
        ],
        law: "\\( q\\,\\mathrm{(J)} = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( \\Delta T = T_f - T_i = 12 - 77 = -65\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 0.14 \\times 350 \\times (-65) \\)"
        ],
        steps: [
          "\\( q = -3185\\,\\mathrm{J} \\)",
          "\\( q\\,\\mathrm{(kJ)} = \\frac{-3185}{1000} \\)"
        ],
        finalAnswer: "\\( q = -3.185\\,\\mathrm{kJ} \\)"
      }
    },
    {
      id: 37,
      type: "calculation",
      metadata: {
        page: "6",
        occurrence: "2022/تمهيدي (تطبيقي)"
      },
      text: "5.4 g من حبيبات ذهب امتصت 300 J من الحرارة عند تسخينها. فإذا علمت أن درجة الحرارة الابتدائية كانت 35 °C، احسب درجة الحرارة النهائية التي سخنت إليها، إذا علمت أن الحرارة النوعية للذهب تساوي 0.13 J/(g·°C).",
      modelAnswer: {
        given: [
          "\\( m = 5.4\\,\\mathrm{g} \\)",
          "\\( q = 300\\,\\mathrm{J} \\)",
          "\\( T_i = 35\\,^\\circ\\mathrm{C} \\)",
          "\\( S = 0.13\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
        ],
        law: "\\( q = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( 300 = 0.13 \\times 5.4 \\times \\Delta T \\)"
        ],
        steps: [
          "\\( 300 = 0.702 \\times \\Delta T \\)",
          "\\( \\Delta T = \\frac{300}{0.702} = 427.35\\,^\\circ\\mathrm{C} \\)",
          "\\( \\Delta T = T_f - T_i \\)",
          "\\( 427.35 = T_f - 35 \\)"
        ],
        finalAnswer: "\\( T_f = 462.35\\,^\\circ\\mathrm{C} \\)"
      }
    },
    {
      id: 38,
      type: "calculation",
      metadata: {
        page: "6",
        occurrence: "2021/تمهيدي (أحيائي)"
      },
      text: "تغيرت درجة حرارة قطعة من المغنيسيوم كتلتها 20 g من 15 °C إلى 55 °C مع اكتسابها حرارة مقدارها 200 J. احسب الحرارة النوعية لقطعة المغنيسيوم.",
      modelAnswer: {
        given: [
          "\\( m = 20\\,\\mathrm{g} \\)",
          "\\( T_i = 15\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 55\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 200\\,\\mathrm{J} \\)"
        ],
        law: "\\( q = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( \\Delta T = T_f - T_i = 55 - 15 = 40\\,^\\circ\\mathrm{C} \\)",
          "\\( 200 = S \\times 20 \\times 40 \\)"
        ],
        steps: [
          "\\( 200 = 800 \\times S \\)",
          "\\( S = \\frac{200}{800} \\)"
        ],
        finalAnswer: "\\( S = 0.25\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
      }
    },
    {
      id: 39,
      type: "calculation",
      metadata: {
        page: "6",
        occurrence: "2023/1 (أحيائي)"
      },
      text: "تغيرت درجة حرارة قطعة من المغنيسيوم كتلتها 8 g من 20 °C إلى 45 °C مع اكتساب حرارة مقدارها 205 J. احسب الحرارة النوعية لقطعة المغنيسيوم.",
      modelAnswer: {
        given: [
          "\\( m = 8\\,\\mathrm{g} \\)",
          "\\( T_i = 20\\,^\\circ\\mathrm{C} \\)",
          "\\( T_f = 45\\,^\\circ\\mathrm{C} \\)",
          "\\( q = 205\\,\\mathrm{J} \\)"
        ],
        law: "\\( q = S \\times m \\times \\Delta T \\)",
        substitution: [
          "\\( \\Delta T = T_f - T_i = 45 - 20 = 25\\,^\\circ\\mathrm{C} \\)",
          "\\( 205 = S \\times 8 \\times 25 \\)"
        ],
        steps: [
          "\\( 205 = 200 \\times S \\)",
          "\\( S = \\frac{205}{200} \\)"
        ],
        finalAnswer: "\\( S = 1.025\\,\\mathrm{J/(g\\cdot^\\circ C)} \\)"
      }
    }
  ]
};

// Export to either browser global window or CommonJS node scope
if (typeof window !== "undefined") {
  window.examData = examData;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = examData;
}
