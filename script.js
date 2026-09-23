/* ============================================================
   FIREBASE
   Integración con Firebase Authentication + Cloud Firestore
============================================================ */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseAuth = window.firebaseAuth;
const firebaseDB = window.firebaseDB;

const FIREBASE_READY = Boolean(firebaseAuth && firebaseDB);

function firebaseAvailable() {
    return FIREBASE_READY;
}

/* ============================================================
   LETRAS MÁGICAS
   VERSIÓN AMPLIADA
   - Profesores privados
   - Alumnos de acceso libre
   - Ejercicios aleatorios
   - Sin repetir ejercicios por estudiante
   - Historial individual
============================================================ */


/* ============================================================
   VARIABLES PRINCIPALES
============================================================ */

let currentStudent = null;
let currentTeacher = null;

let currentGame = null;
let currentQuestion = 0;
let score = 0;


/* ============================================================
   PANTALLAS
============================================================ */

const screens = {

    login: document.getElementById("loginScreen"),

    register: document.getElementById("registerScreen"),

    student: document.getElementById("studentScreen"),

    game: document.getElementById("gameScreen"),

    result: document.getElementById("resultScreen"),

    teacher: document.getElementById("teacherScreen")

};


/* ============================================================
   CAMBIAR PANTALLA
============================================================ */

function showScreen(screen) {

    Object.values(screens).forEach(s => {

        s.classList.remove("active");

    });

    screen.classList.add("active");

}


/* ============================================================
   BANCO GRANDE DE PALABRAS
============================================================ */

const wordBank = [

"abeja","abierto","abuela","abuelo","aceite","acuario","adivina",
"agua","águila","aire","alambre","alegría","alfombra","almohada",
"amigo","amistad","animal","anillo","árbol","arena","armario",
"arroz","avión","azúcar","azul","balón","banana","barco","bebé",
"biblioteca","bicicleta","blanco","bloque","boca","bola","bosque",
"botella","brazo","brisa","caballo","cabeza","cacao","cadena",
"caja","camino","camisa","campana","campo","cangrejo","caracol",
"caramelo","carne","carpeta","carta","casa","castillo","cebolla",
"cereza","cielo","cien","ciudad","clase","cocina","colegio",
"colina","comida","conejo","corazón","correr","cuchara","cuaderno",
"cuadro","cuento","dedo","delfín","deporte","día","diente","dinero",
"domingo","dragón","dulce","elefante","estrella","escuela",
"escalera","espejo","espada","espalda","familia","fantasma",
"felicidad","flor","florero","foca","fuego","fuente","galleta",
"gallina","gato","gigante","girasol","globo","granja","grillo",
"helado","hermano","hermana","hielo","hierba","higo","historia",
"hoja","hombre","hormiga","hospital","iglesia","isla","jabón",
"jardín","jirafa","joven","juego","juguete","lago","lápiz",
"leche","león","libro","lobo","luna","maceta","mamá","mar",
"mariposa","mesa","metal","mochila","mono","montaña","morado",
"música","naranja","nariz","nube","número","noche","niña","niño",
"oveja","padre","paloma","pan","papá","papel","parque","pelota",
"perro","pescado","pez","piedra","piña","planta","plátano",
"plato","playa","puerta","queso","ratón","reloj","río","rosa",
"salón","sandía","sapo","semilla","serpiente","silla","sol",
"sopa","tambor","taza","techo","teléfono","televisión","tigre",
"tierra","tomate","tortuga","tren","universo","vaca","vaso",
"ventana","verde","viaje","viernes","volcán","zapato","zorro",

"avena","avellana","aventura","barba","barrio","bebida","bicicleta",
"botón","bufanda","burbuja","cabaña","caballo","calabaza","camello",
"campana","canasta","canción","canguro","capitán","carpintero",
"carretera","cascada","cereza","chocolate","chupeta","ciencia",
"cinturón","cocodrilo","cometa","computador","concierto","corbata",
"cuchillo","dinosaurio","disfraz","doctor","domingo","durazno",
"enfermera","escritorio","escudo","espantapájaros","estudiante",
"familia","farmacia","fiesta","flauta","flamenco","fruta","galaxia",
"gallina","ganado","garaje","gato","gimnasio","gorila","grande",
"granja","guante","guitarra","hamburguesa","heladería","hermoso",
"herradura","huevo","iglesia","insecto","invierno","isla","jardín",
"jirafa","jueves","lagartija","lámpara","lavadora","lechuga",
"lengua","limón","llave","lluvia","madera","maleta","mandarina",
"manzana","mapa","máquina","martes","medicina","mercado","miércoles",
"mermelada","micrófono","miércoles","nacimiento","naranja","navidad",
"nevera","noviembre","océano","octubre","oficina","oreja","orquesta",
"otoño","pájaro","palacio","panadería","pantalón","papagayo",
"paraguas","pastel","patineta","payaso","pecera","peine","pepino",
"periódico","pijama","pirata","piscina","planeta","plátano","policía",
"primavera","princesa","profesor","puente","pueblo","quesadilla",
"radio","regalo","reina","restaurante","revista","sábado","sandalia",
"sandía","semáforo","septiembre","sombrero","sábado","telaraña",
"tienda","tobillo","tormenta","trabajo","tractor","universidad",
"vacaciones","vampiro","velero","verano","vestido","viento","viernes",
"zanahoria","zapatería","zoológico",

"abejorro","abecedario","aventurero","bibliotecario","carretera",
"campesino","carnaval","celebración","cerebro","chicharra",
"chocolate","cigüeña","ciudadano","comerciante","compañero",
"construcción","cocodrilo","decoración","desayuno","descanso",
"dibujante","electricidad","enorme","espectáculo","experimento",
"explorador","fotografía","futbolista","geografía","golondrina",
"herramienta","imaginación","impresora","jardinero","laboratorio",
"lavandería","libertad","marinero","matemáticas","naturaleza",
"necesario","observatorio","ordenador","pescador","planificación",
"pregunta","presentación","primero","proyecto","recuerdo","regalo",
"recreo","rescate","semana","servidor","sociedad","supermercado",
"temperatura","universidad","vegetales","veterinario","zapatilla",

"bailar","beber","brincar","buscar","caminar","cantar","cocinar",
"comer","comprar","correr","dibujar","dormir","empezar","entrar",
"escuchar","escribir","estudiar","ganar","gritar","hablar","jugar",
"lavar","leer","mirar","nadar","observar","pasear","pintar","preparar",
"recoger","reír","saltar","soñar","tocar","trabajar","viajar",
"visitar","volar","ayudar","aprender","bajar","cerrar","contestar",
"descubrir","encontrar","explicar","guardar","imaginar","limpiar",
"llevar","mostrar","necesitar","ordenar","participar","practicar",
"recortar","resolver","subir","terminar","usar",

"bonito","bonita","grande","pequeño","pequeña","rápido","rápida",
"lento","lenta","fuerte","débil","feliz","triste","amable",
"inteligente","curioso","curiosa","valiente","tranquilo","tranquila",
"brillante","oscuro","oscura","limpio","limpia","sucio","sucia",
"nuevo","nueva","viejo","vieja","joven","alto","alta","bajo","baja",
"caliente","frío","fría","dulce","salado","salada","suave","duro",
"redondo","redonda","cuadrado","cuadrada","divertido","divertida",
"famoso","famosa","especial","fantástico","fantástica","maravilloso",
"maravillosa","peligroso","peligrosa","seguro","segura"

];


/* ============================================================
   ELIMINAR DUPLICADOS DEL BANCO
============================================================ */

const uniqueWords = [...new Set(wordBank)];


/* ============================================================
   MEZCLAR ARRAY
============================================================ */

function shuffle(array) {

    const copy = [...array];

    for (
        let i = copy.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [copy[i], copy[j]] =
            [copy[j], copy[i]];

    }

    return copy;
}


/* ============================================================
   OBTENER PALABRA NO UTILIZADA
============================================================ */

function getUnusedWord(student, category = "general") {

    if (!student.usedQuestions) {

        student.usedQuestions = {};

    }


    if (!student.usedQuestions[category]) {

        student.usedQuestions[category] = [];

    }


    const used =
        student.usedQuestions[category];


    const available =
        uniqueWords.filter(
            word =>
                !used.includes(word)
        );


    if (available.length === 0) {

        /*
         * Si se acaban las palabras de esa categoría,
         * generamos una nueva ronda.
         *
         * Esto permite seguir jugando.
         */

        student.usedQuestions[category] = [];

        return getUnusedWord(
            student,
            category
        );

    }


    const word =
        available[
            Math.floor(
                Math.random() *
                available.length
            )
        ];


    student.usedQuestions[category].push(
        word
    );


    return word;

}


/* ============================================================
   PALABRAS PARA COMPLETAR
============================================================ */

function createSpellingQuestion(student) {

    const word =
        getUnusedWord(
            student,
            "spelling"
        );


    let position = -1;

    let correctLetter = "";

    let alternatives = [];


    /*
     * C/S/Z
     */

    if (/[csz]/i.test(word)) {

        position =
            word.search(/[csz]/i);

        correctLetter =
            word[position].toLowerCase();

        alternatives =
            ["c", "s", "z"];

    }

    /*
     * B/V
     */

    else if (/[bv]/i.test(word)) {

        position =
            word.search(/[bv]/i);

        correctLetter =
            word[position].toLowerCase();

        alternatives =
            ["b", "v"];

    }

    /*
     * G/J
     */

    else if (/[gj]/i.test(word)) {

        position =
            word.search(/[gj]/i);

        correctLetter =
            word[position].toLowerCase();

        alternatives =
            ["g", "j"];

    }

    /*
     * LL/Y
     */

    else if (/[ly]/i.test(word)) {

        position =
            word.search(/[ly]/i);

        correctLetter =
            word[position].toLowerCase();

        alternatives =
            ["l", "y"];

    }

    /*
     * H
     */

    else {

        position = 0;

        correctLetter =
            word[0].toLowerCase();

        alternatives = [
            correctLetter,
            correctLetter === "a"
                ? "h"
                : "a"
        ];

    }


    const questionText =
        word.substring(
            0,
            position
        )
        +
        "_"
        +
        word.substring(
            position + 1
        );


    const options =
        shuffle(
            alternatives
        );


    return {

        type: "spelling",

        question:
            `Completa correctamente la palabra: ${questionText}`,

        options: options,

        answer: correctLetter,

        originalWord: word

    };

}


/* ============================================================
   SEPARAR PALABRAS EN SÍLABAS
============================================================ */

function syllabify(word) {

    const vowels =
        "aeiouáéíóúü";


    const result = [];

    let current = "";


    for (
        let i = 0;
        i < word.length;
        i++
    ) {

        const letter =
            word[i].toLowerCase();


        current += letter;


        const next =
            word[i + 1]
            ? word[i + 1].toLowerCase()
            : "";


        const next2 =
            word[i + 2]
            ? word[i + 2].toLowerCase()
            : "";


        const isVowel =
            vowels.includes(letter);


        const nextIsVowel =
            vowels.includes(next);


        /*
         * Separación sencilla para
         * palabras apropiadas para primaria.
         */

        if (
            isVowel &&
            next &&
            !nextIsVowel &&
            next2 &&
            vowels.includes(next2)
        ) {

            result.push(current);

            current = "";

        }

        else if (
            isVowel &&
            next &&
            nextIsVowel &&
            !(
                "aeiou".includes(letter) &&
                "aeiou".includes(next)
            )
        ) {

            /*
             * No separar vocales juntas.
             */

        }

    }


    if (current) {

        result.push(current);

    }


    /*
     * Si el algoritmo no consiguió una
     * separación útil, usamos partes.
     */

    if (
        result.length <= 1 &&
        word.length > 4
    ) {

        const middle =
            Math.ceil(
                word.length / 2
            );


        return [
            word.substring(0, middle),
            word.substring(middle)
        ];

    }


    return result;

}


/* ============================================================
   CREAR EJERCICIO DE SÍLABAS
============================================================ */

function createSyllableQuestion(student) {

    const word =
        getUnusedWord(
            student,
            "syllables"
        );


    const syllables =
        syllabify(word);


    const mixed =
        shuffle(syllables);


    return {

        type: "syllables",

        question:
            `Ordena las sílabas para formar una palabra: ${mixed.join(" - ")}`,

        options: shuffle([

            word,

            shuffle(
                [...word]
            ).join(""),

            syllables
                .slice()
                .reverse()
                .join("")

        ]),

        answer: word

    };

}


/* ============================================================
   CREAR DICTADO
============================================================ */

function createDictationQuestion(student) {

    const word =
        getUnusedWord(
            student,
            "dictation"
        );


    return {

        type: "dictation",

        question:
            "Escucha la palabra y escríbela correctamente.",

        word: word,

        answer: word

    };

}


/* ============================================================
   BANCO DE PERSONAJES
============================================================ */

const characters = [

"María",
"Pedro",
"Ana",
"Juan",
"Sofía",
"Lucas",
"Valentina",
"Mateo",
"Camila",
"Daniel",
"Laura",
"Santiago",
"Isabela",
"Tomás",
"Juliana",
"Samuel",
"Gabriela",
"Nicolás",
"Emma",
"David"

];


/* ============================================================
   LUGARES
============================================================ */

const places = [

"el parque",
"la escuela",
"la biblioteca",
"el bosque",
"la playa",
"la granja",
"el jardín",
"la montaña",
"el pueblo",
"la casa",
"el zoológico",
"el museo",
"el mercado",
"la plaza",
"el río",
"el lago",
"el castillo",
"la cancha",
"el colegio",
"la tienda"

];


/* ============================================================
   OBJETOS
============================================================ */

const objects = [

"un libro",
"una pelota",
"una mochila",
"un lápiz",
"una bicicleta",
"un juguete",
"una cometa",
"un mapa",
"una caja",
"una pelota roja",
"una carta",
"una fotografía",
"un cuaderno",
"un sombrero",
"una llave",
"un regalo",
"una flor",
"un balón",
"una guitarra",
"un cuento"

];


/* ============================================================
   ACCIONES
============================================================ */

const actions = [

"encontró",
"buscó",
"llevó",
"guardó",
"observó",
"encontró",
"recogió",
"compartió",
"regaló",
"descubrió",
"compró",
"dibujó",
"leyó",
"escribió",
"llevó",
"visitó",
"ayudó",
"saludó",
"cuidó",
"preparó"

];


/* ============================================================
   GENERAR LECTURA
============================================================ */

function createReadingQuestion(student) {


    if (!student.usedQuestions) {

        student.usedQuestions = {};

    }


    if (!student.usedQuestions.reading) {

        student.usedQuestions.reading = [];

    }


    let character =
        characters[
            Math.floor(
                Math.random() *
                characters.length
            )
        ];


    let place =
        places[
            Math.floor(
                Math.random() *
                places.length
            )
        ];


    let object =
        objects[
            Math.floor(
                Math.random() *
                objects.length
            )
        ];


    let action =
        actions[
            Math.floor(
                Math.random() *
                actions.length
            )
        ];


    const key =
        `${character}-${place}-${object}-${action}`;


    /*
     * Evitar combinaciones repetidas.
     */

    if (
        student.usedQuestions.reading
            .includes(key)
    ) {

        return createReadingQuestion(
            student
        );

    }


    student.usedQuestions.reading.push(
        key
    );


    const story =
        `${character} estaba en ${place}. ` +
        `Mientras caminaba, ${character} ${action} ` +
        `${object}. ` +
        `Después decidió llevarlo a casa ` +
        `para enseñárselo a su familia.`;


    const correctAnswer =
        `En ${place}`;


    const wrongAnswers = shuffle([

        "En el supermercado",

        "En otro país",

        "En su habitación",

        "En una montaña",

        "En el aeropuerto"

    ]).slice(0, 2);


    return {

        type: "reading",

        story: story,

        question:
            `¿Dónde estaba ${character}?`,

        options:
            shuffle([
                correctAnswer,
                ...wrongAnswers
            ]),

        answer:
            correctAnswer

    };

}


/* ============================================================
   GENERAR EJERCICIOS
============================================================ */

function generateQuestion(student, game) {


    if (game === "words") {

        return createSpellingQuestion(
            student
        );

    }


    if (game === "syllables") {

        return createSyllableQuestion(
            student
        );

    }


    if (game === "reading") {

        return createReadingQuestion(
            student
        );

    }


    if (game === "dictation") {

        return createDictationQuestion(
            student
        );

    }

}


/* ============================================================
   ROLES
============================================================ */

const studentRoleBtn =
    document.getElementById(
        "studentRoleBtn"
    );


const teacherRoleBtn =
    document.getElementById(
        "teacherRoleBtn"
    );


const studentLogin =
    document.getElementById(
        "studentLogin"
    );


const teacherLogin =
    document.getElementById(
        "teacherLogin"
    );


studentRoleBtn.addEventListener(
    "click",
    () => {

        studentRoleBtn.classList.add(
            "selected"
        );

        teacherRoleBtn.classList.remove(
            "selected"
        );

        studentLogin.classList.remove(
            "hidden"
        );

        teacherLogin.classList.add(
            "hidden"
        );

    }
);


teacherRoleBtn.addEventListener(
    "click",
    () => {

        teacherRoleBtn.classList.add(
            "selected"
        );

        studentRoleBtn.classList.remove(
            "selected"
        );

        teacherLogin.classList.remove(
            "hidden"
        );

        studentLogin.classList.add(
            "hidden"
        );

    }
);


/* ============================================================
   ENTRAR COMO ALUMNO
   Ahora guarda y recupera estudiantes desde Cloud Firestore.
============================================================ */

document
    .getElementById(
        "enterStudentBtn"
    )
    .addEventListener(
        "click",
        async () => {

            const name =
                document
                    .getElementById(
                        "studentName"
                    )
                    .value
                    .trim();

            if (!name) {
                alert("Escribe tu nombre para comenzar.");
                return;
            }

            const defaultStudent = {
                id: Date.now(),
                name: name,
                nameLower: name.toLowerCase(),
                stars: 0,
                coins: 0,
                level: 1,
                games: 0,
                correct: 0,
                mistakes: [],
                usedQuestions: {
                    spelling: [],
                    syllables: [],
                    reading: [],
                    dictation: []
                }
            };

            try {
                let student = null;

                if (firebaseAvailable()) {
                    const q = query(
                        collection(firebaseDB, "students"),
                        where("nameLower", "==", name.toLowerCase())
                    );
                    const snap = await getDocs(q);

                    if (!snap.empty) {
                        student = {
                            id: snap.docs[0].data().id || snap.docs[0].id,
                            ...snap.docs[0].data()
                        };
                    }
                }

                if (!student) {
                    const students = JSON.parse(
                        localStorage.getItem("students") || "[]"
                    );
                    student = students.find(
                        s => s.name && s.name.toLowerCase() === name.toLowerCase()
                    );
                }

                if (!student) {
                    student = defaultStudent;
                    if (firebaseAvailable()) {
                        await setDoc(
                            doc(firebaseDB, "students", String(student.id)),
                            { ...student, createdAt: serverTimestamp() }
                        );
                    }
                }

                if (!student.usedQuestions) {
                    student.usedQuestions = {
                        spelling: [],
                        syllables: [],
                        reading: [],
                        dictation: []
                    };
                }

                if (!student.mistakes) student.mistakes = [];
                student.nameLower = name.toLowerCase();
                currentStudent = student;

                localStorage.setItem(
                    "currentStudent",
                    JSON.stringify(currentStudent)
                );

                await saveStudent();
                updateStudentScreen();
                showScreen(screens.student);

            } catch (error) {
                console.error("Error al conectar con Firebase:", error);
                alert("⚠️ No se pudo conectar con Firebase. Revisa tu conexión y vuelve a intentarlo.");
            }
        }
    );


/* ============================================================
   ACTUALIZAR ALUMNO
============================================================ */

function updateStudentScreen() {


    if (!currentStudent) return;


    document
        .getElementById(
            "studentWelcome"
        )
        .textContent =
        `Hola, ${currentStudent.name} 👋`;


    document
        .getElementById(
            "stars"
        )
        .textContent =
        currentStudent.stars;


    document
        .getElementById(
            "coins"
        )
        .textContent =
        currentStudent.coins;


    document
        .getElementById(
            "level"
        )
        .textContent =
        currentStudent.level;

}


/* ============================================================
   REGISTRO PROFESOR
============================================================ */

document
    .getElementById(
        "showRegisterBtn"
    )
    .addEventListener(
        "click",
        () => {


            document.getElementById(
                "registerName"
            ).value = "";


            document.getElementById(
                "registerUsername"
            ).value = "";


            document.getElementById(
                "registerEmail"
            ).value = "";


            document.getElementById(
                "registerPassword"
            ).value = "";


            document.getElementById(
                "registerPassword2"
            ).value = "";


            document.getElementById(
                "registerMessage"
            ).textContent = "";


            showScreen(
                screens.register
            );

        }
    );


/* ============================================================
   VOLVER AL LOGIN
============================================================ */

document
    .getElementById(
        "backLoginBtn"
    )
    .addEventListener(
        "click",
        () => {

            showScreen(
                screens.login
            );

        }
    );


/* ============================================================
   REGISTRAR PROFESOR
============================================================ */

document
    .getElementById(
        "registerTeacherBtn"
    )
    .addEventListener(
        "click",
        registerTeacher
    );


async function registerTeacher() {

    const name = document.getElementById("registerName").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const password2 = document.getElementById("registerPassword2").value;
    const message = document.getElementById("registerMessage");

    if (!name || !username || !email || !password || !password2) {
        message.textContent = "⚠️ Completa todos los campos.";
        return;
    }
    if (password.length < 6) {
        message.textContent = "⚠️ La contraseña debe tener mínimo 6 caracteres.";
        return;
    }
    if (password !== password2) {
        message.textContent = "⚠️ Las contraseñas no coinciden.";
        return;
    }

    if (!firebaseAvailable()) {
        message.textContent = "❌ Firebase no está conectado.";
        return;
    }

    try {
        const usernameLower = username.toLowerCase();
        const usernameQuery = query(
            collection(firebaseDB, "teachers"),
            where("usernameLower", "==", usernameLower)
        );
        const usernameSnap = await getDocs(usernameQuery);
        if (!usernameSnap.empty) {
            message.textContent = "❌ Ese usuario ya existe.";
            return;
        }

        const emailQuery = query(
            collection(firebaseDB, "teachers"),
            where("emailLower", "==", email.toLowerCase())
        );
        const emailSnap = await getDocs(emailQuery);
        if (!emailSnap.empty) {
            message.textContent = "❌ Ese correo ya está registrado.";
            return;
        }

        const credential = await createUserWithEmailAndPassword(
            firebaseAuth,
            email,
            password
        );

        const teacher = {
            uid: credential.user.uid,
            name,
            username,
            usernameLower,
            email,
            emailLower: email.toLowerCase(),
            createdAt: serverTimestamp(),
            students: []
        };

        await setDoc(
            doc(firebaseDB, "teachers", credential.user.uid),
            teacher
        );

        currentTeacher = { ...teacher, uid: credential.user.uid };
        localStorage.setItem("currentTeacher", JSON.stringify(currentTeacher));
        message.textContent = "✅ Cuenta creada correctamente. Ahora puedes iniciar sesión.";

        await signOut(firebaseAuth);

    } catch (error) {
        console.error("Error al registrar profesor:", error);
        if (error.code === "auth/email-already-in-use") {
            message.textContent = "❌ Ese correo ya está registrado en Firebase.";
        } else if (error.code === "auth/invalid-email") {
            message.textContent = "❌ El correo no es válido.";
        } else if (error.code === "auth/weak-password") {
            message.textContent = "❌ La contraseña es demasiado débil.";
        } else {
            message.textContent = "❌ No se pudo crear la cuenta. Revisa Firebase y vuelve a intentarlo.";
        }
    }
}


/* ============================================================
   LOGIN PROFESOR
============================================================ */

document
    .getElementById(
        "loginTeacherBtn"
    )
    .addEventListener(
        "click",
        loginTeacher
    );


async function loginTeacher() {

    const username = document.getElementById("teacherUsername").value.trim();
    const password = document.getElementById("teacherPassword").value;
    const message = document.getElementById("teacherMessage");

    if (!username || !password) {
        message.textContent = "⚠️ Escribe usuario y contraseña.";
        return;
    }
    if (!firebaseAvailable()) {
        message.textContent = "❌ Firebase no está conectado.";
        return;
    }

    try {
        const q = query(
            collection(firebaseDB, "teachers"),
            where("usernameLower", "==", username.toLowerCase())
        );
        const snap = await getDocs(q);

        if (snap.empty) {
            message.textContent = "❌ Usuario o contraseña incorrectos.";
            return;
        }

        const teacherData = snap.docs[0].data();
        await signInWithEmailAndPassword(
            firebaseAuth,
            teacherData.email,
            password
        );

        currentTeacher = {
            ...teacherData,
            uid: snap.docs[0].id
        };

        localStorage.setItem("currentTeacher", JSON.stringify(currentTeacher));
        message.textContent = "";
        await updateTeacherScreen();
        showScreen(screens.teacher);

    } catch (error) {
        console.error("Error al iniciar sesión del profesor:", error);
        message.textContent = "❌ Usuario o contraseña incorrectos.";
    }
}


/* ============================================================
   PANEL PROFESOR
============================================================ */

async function updateTeacherScreen() {

    if (!currentTeacher) return;

    document.getElementById("teacherWelcome").textContent =
        `Bienvenido, ${currentTeacher.name}`;
    document.getElementById("teacherProfileName").textContent =
        currentTeacher.name;
    document.getElementById("teacherProfileEmail").textContent =
        currentTeacher.email;

    let students = [];

    try {
        if (firebaseAvailable()) {
            const snap = await getDocs(collection(firebaseDB, "students"));
            students = snap.docs.map(d => ({ id: d.data().id || d.id, ...d.data() }));
            localStorage.setItem("students", JSON.stringify(students));
        } else {
            students = JSON.parse(localStorage.getItem("students") || "[]");
        }
    } catch (error) {
        console.error("Error cargando estudiantes desde Firestore:", error);
        students = JSON.parse(localStorage.getItem("students") || "[]");
    }

    document.getElementById("totalStudents").textContent = students.length;

    let totalStars = 0;
    let totalGames = 0;
    students.forEach(student => {
        totalStars += student.stars || 0;
        totalGames += student.games || 0;
    });

    document.getElementById("totalStars").textContent = totalStars;
    document.getElementById("totalGames").textContent = totalGames;

    renderStudents(students);
    renderMistakes(students);
}


/* ============================================================
   MOSTRAR ESTUDIANTES
============================================================ */

function renderStudents(
    students
) {

    const container =
        document.getElementById(
            "studentsList"
        );

    container.innerHTML = "";

    if (students.length === 0) {

        container.innerHTML = `

            <div class="student-row">

                👥 No hay estudiantes
                registrados todavía.

            </div>

        `;

        return;
    }

    students.forEach(
        student => {

            const percentage =
                student.games > 0
                ?
                Math.min(
                    100,
                    Math.round(
                        (
                            student.correct
                            /
                            (
                                student.games * 4
                            )
                        )
                        * 100
                    )
                )
                :
                0;

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "student-row";

            div.innerHTML = `

                <h3>
                    🧒 ${student.name}
                </h3>

                <p class="student-info">

                    ⭐ ${student.stars || 0}

                    &nbsp;&nbsp;

                    🪙 ${student.coins || 0}

                    &nbsp;&nbsp;

                    🏆 Nivel ${student.level || 1}

                    &nbsp;&nbsp;

                    🎮 ${student.games || 0}
                    actividades

                </p>

                <div class="progress-bar">

                    <div
                        class="progress"
                        style="width:${percentage}%"
                    ></div>

                </div>

                <small>

                    Progreso aproximado:
                    ${percentage}%

                </small>

                <br><br>

                <button
                    class="delete-student-history"
                    data-id="${student.id}"
                >

                    🧹 Borrar historial

                </button>

                <button
                    class="delete-student-account"
                    data-id="${student.id}"
                >

                    🚨 Eliminar cuenta

                </button>

            `;

            container.appendChild(
                div
            );

        }
    );

    document
        .querySelectorAll(
            ".delete-student-history"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const studentId =
                            Number(
                                button.dataset.id
                            );

                        clearStudentHistory(
                            studentId
                        );

                    }
                );

            }
        );

    document
        .querySelectorAll(
            ".delete-student-account"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const studentId =
                            Number(
                                button.dataset.id
                            );

                        deleteStudentAccount(
                            studentId
                        );

                    }
                );

            }
        );

}


/* ============================================================
   ELIMINAR CUENTA COMPLETA DEL ESTUDIANTE
============================================================ */

async function deleteStudentAccount(
    studentId
) {

    if (!currentTeacher) {
        alert("❌ Debes iniciar sesión como profesor.");
        return;
    }

    let student = null;
    try {
        if (firebaseAvailable()) {
            const ref = doc(firebaseDB, "students", String(studentId));
            const snap = await getDoc(ref);
            if (snap.exists()) student = { id: studentId, ...snap.data() };
        }
    } catch (error) {
        console.error(error);
    }

    if (!student) {
        const students = JSON.parse(localStorage.getItem("students") || "[]");
        student = students.find(s => Number(s.id) === Number(studentId));
    }

    if (!student) {
        alert("❌ No se encontró el estudiante.");
        return;
    }

    const confirmation = confirm(
        `🚨 ELIMINAR CUENTA\n\n` +
        `Estás a punto de eliminar completamente la cuenta de:\n\n` +
        `👤 ${student.name}\n\n` +
        `Se eliminarán sus datos de Firestore y de este navegador.\n\n` +
        `⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER.\n\n` +
        `¿Deseas continuar?`
    );

    if (!confirmation) return;

    try {
        if (firebaseAvailable()) {
            await deleteDoc(doc(firebaseDB, "students", String(studentId)));
        }

        let students = JSON.parse(localStorage.getItem("students") || "[]");
        students = students.filter(s => Number(s.id) !== Number(studentId));
        localStorage.setItem("students", JSON.stringify(students));

        const savedStudent = localStorage.getItem("currentStudent");
        if (savedStudent) {
            const loggedStudent = JSON.parse(savedStudent);
            if (Number(loggedStudent.id) === Number(studentId)) {
                currentStudent = null;
                localStorage.removeItem("currentStudent");
            }
        }

        await updateTeacherScreen();
        alert(`✅ La cuenta de ${student.name} fue eliminada correctamente.`);
    } catch (error) {
        console.error("Error eliminando estudiante:", error);
        alert("❌ No se pudo eliminar la cuenta del estudiante en Firebase.");
    }
}



async function clearStudentHistory(
    studentId
) {

    if (!currentTeacher) {
        alert("❌ Debes iniciar sesión como profesor.");
        return;
    }

    let students = JSON.parse(localStorage.getItem("students") || "[]");
    let student = students.find(s => Number(s.id) === Number(studentId));

    if (firebaseAvailable()) {
        try {
            const snap = await getDoc(doc(firebaseDB, "students", String(studentId)));
            if (snap.exists()) student = { id: studentId, ...snap.data() };
        } catch (error) {
            console.error(error);
        }
    }

    if (!student) {
        alert("❌ No se encontró el estudiante.");
        return;
    }

    const confirmation = confirm(
        `⚠️ ¿Quieres borrar el historial de ${student.name}?\n\n` +
        `Se eliminarán actividades, respuestas, errores, estrellas, monedas, nivel y ejercicios ya realizados.\n\n` +
        `La cuenta del estudiante NO será eliminada.`
    );

    if (!confirmation) return;

    student.stars = 0;
    student.coins = 0;
    student.level = 1;
    student.games = 0;
    student.correct = 0;
    student.mistakes = [];
    student.usedQuestions = { spelling: [], syllables: [], reading: [], dictation: [] };

    try {
        if (firebaseAvailable()) {
            await setDoc(
                doc(firebaseDB, "students", String(studentId)),
                student,
                { merge: true }
            );
        }

        const index = students.findIndex(s => Number(s.id) === Number(studentId));
        if (index !== -1) students[index] = student;
        else students.push(student);
        localStorage.setItem("students", JSON.stringify(students));

        const savedStudent = localStorage.getItem("currentStudent");
        if (savedStudent) {
            const loggedStudent = JSON.parse(savedStudent);
            if (Number(loggedStudent.id) === Number(studentId)) {
                currentStudent = student;
                localStorage.setItem("currentStudent", JSON.stringify(student));
            }
        }

        await updateTeacherScreen();
        alert(`✅ El historial de ${student.name} fue borrado correctamente.`);
    } catch (error) {
        console.error("Error borrando historial:", error);
        alert("❌ No se pudo actualizar el estudiante en Firebase.");
    }
}


/* ============================================================
   MOSTRAR ERRORES
============================================================ */

function renderMistakes(
    students
) {


    const container =
        document.getElementById(
            "mistakesList"
        );


    container.innerHTML = "";


    let mistakes = [];


    students.forEach(
        student => {


            if (
                student.mistakes
            ) {


                student.mistakes.forEach(
                    mistake => {


                        mistakes.push({

                            student:
                                student.name,

                            mistake:
                                mistake

                        });

                    }
                );

            }

        }
    );


    if (
        mistakes.length === 0
    ) {

        container.innerHTML = `

            <div class="mistake-row">

                🎉 No hay errores registrados.

            </div>

        `;

        return;

    }


    mistakes.forEach(
        item => {


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "mistake-row";


            div.innerHTML = `

                🧒 <strong>
                    ${item.student}
                </strong>

                <br>

                ❌ ${item.mistake}

            `;


            container.appendChild(
                div
            );

        }
    );

}


/* ============================================================
   ABRIR JUEGO
============================================================ */

document
    .querySelectorAll(
        ".game-card"
    )
    .forEach(
        card => {


            card.addEventListener(
                "click",
                () => {


                    if (!currentStudent) {

                        alert(
                            "Primero debes entrar como estudiante."
                        );

                        return;

                    }


                    currentGame =
                        card.dataset.game;


                    currentQuestion = 0;

                    score = 0;


                    showScreen(
                        screens.game
                    );


                    loadQuestion();

                }
            );

        }
    );


/* ============================================================
   CARGAR PREGUNTA
============================================================ */

function loadQuestion() {


    const content =
        document.getElementById(
            "gameContent"
        );


    const title =
        document.getElementById(
            "gameTitle"
        );


    content.innerHTML = "";


    document
        .getElementById(
            "gameMessage"
        )
        .textContent = "";


    const titles = {

        words:
            "✍️ Palabras mágicas",

        syllables:
            "🔤 Ordena las sílabas",

        reading:
            "📖 La biblioteca",

        dictation:
            "🔊 El gran dictado"

    };


    title.textContent =
        titles[currentGame];


    const question =
        generateQuestion(
            currentStudent,
            currentGame
        );


    currentQuestion =
        question;


    saveStudent();


    const box =
        document.createElement(
            "div"
        );


    box.className =
        "question-box";


    /*
     * LECTURA
     */

    if (
        question.type
        ===
        "reading"
    ) {


        const story =
            document.createElement(
                "p"
            );


        story.textContent =
            question.story;


        story.style.fontSize =
            "19px";


        story.style.lineHeight =
            "1.6";


        story.style.marginBottom =
            "25px";


        box.appendChild(
            story
        );

    }


    const questionText =
        document.createElement(
            "h2"
        );


    questionText.textContent =
        question.question;


    box.appendChild(
        questionText
    );


    /*
     * DICTADO
     */

    if (
        question.type
        ===
        "dictation"
    ) {


        const speakBtn =
            document.createElement(
                "button"
            );


        speakBtn.className =
            "main-btn";


        speakBtn.textContent =
            "🔊 Escuchar palabra";


        speakBtn.onclick =
            () => {


                const speech =
                    new SpeechSynthesisUtterance(
                        question.word
                    );


                speech.lang =
                    "es-ES";


                speech.rate =
                    0.8;


                speechSynthesis.speak(
                    speech
                );

            };


        box.appendChild(
            speakBtn
        );


        const input =
            document.createElement(
                "input"
            );


        input.id =
            "dictationInput";


        input.placeholder =
            "Escribe la palabra aquí";


        input.style.width =
            "100%";


        input.style.padding =
            "15px";


        input.style.marginTop =
            "20px";


        input.style.borderRadius =
            "10px";


        input.style.border =
            "2px solid #ddd";


        input.style.fontSize =
            "18px";


        box.appendChild(
            input
        );


        const button =
            document.createElement(
                "button"
            );


        button.className =
            "main-btn";


        button.textContent =
            "✅ Comprobar";


        button.onclick =
            () => {


                checkAnswer(
                    input.value.trim()
                );

            };


        box.appendChild(
            button
        );

    }


    /*
     * OPCIONES
     */

    else {


        question.options
            .forEach(
                option => {


                    const button =
                        document.createElement(
                            "button"
                        );


                    button.className =
                        "option-btn";


                    button.textContent =
                        option;


                    button.onclick =
                        () => {


                            checkAnswer(
                                option
                            );

                        };


                    box.appendChild(
                        button
                    );

                }
            );

    }


    content.appendChild(
        box
    );

}


/* ============================================================
   COMPROBAR RESPUESTA
============================================================ */

function checkAnswer(
    answer
) {


    if (
        !currentStudent
    ) {

        return;

    }


    const question =
        currentQuestion;


    const cleanAnswer =
        String(answer)
            .trim()
            .toLowerCase();


    const correctAnswer =
        String(question.answer)
            .trim()
            .toLowerCase();


    const correct =
        cleanAnswer
        ===
        correctAnswer;


    if (correct) {


        score++;


        currentStudent.stars += 2;


        currentStudent.coins += 5;


        currentStudent.correct++;


        document
            .getElementById(
                "gameMessage"
            )
            .textContent =
            "🎉 ¡Respuesta correcta!";

    }


    else {


        if (
            !currentStudent.mistakes
        ) {

            currentStudent.mistakes = [];

        }


        currentStudent.mistakes.push(

            `${question.type}: ` +
            `${answer || "Sin respuesta"} ` +
            `→ correcta: ${question.answer}`

        );


        document
            .getElementById(
                "gameMessage"
            )
            .textContent =
            `❌ La respuesta correcta era: ${question.answer}`;

    }


    saveStudent();


    /*
     * Esperamos antes de pasar
     * al siguiente ejercicio.
     */

    setTimeout(
        () => {

            finishQuestion();

        },
        1000
    );

}


/* ============================================================
   SIGUIENTE PREGUNTA
============================================================ */

function finishQuestion() {


    /*
     * En cada partida se realizan
     * 5 ejercicios diferentes.
     */

    if (
        currentQuestionNumber >= 4
    ) {

        finishGame();

        return;

    }


    currentQuestionNumber++;


    loadQuestion();

}


/* ============================================================
   CONTADOR DE PREGUNTAS
============================================================ */

let currentQuestionNumber = 0;


/*
 * Reiniciamos el contador cada vez
 * que comienza una prueba.
 */

document
    .querySelectorAll(
        ".game-card"
    )
    .forEach(
        card => {


            card.addEventListener(
                "click",
                () => {

                    currentQuestionNumber =
                        0;

                }
            );

        }
    );


/* ============================================================
   TERMINAR PRUEBA
============================================================ */

function finishGame() {


    currentStudent.games++;


    /*
     * Subir nivel según estrellas.
     */

    currentStudent.level =
        Math.floor(
            currentStudent.stars / 20
        ) + 1;


    saveStudent();


    document
        .getElementById(
            "resultText"
        )
        .textContent =
        `Respondiste correctamente ${score} de 5 ejercicios.`;


    document
        .getElementById(
            "resultStars"
        )
        .textContent =
        "⭐".repeat(
            Math.max(
                1,
                score
            )
        );


    showScreen(
        screens.result
    );

}


/* ============================================================
   GUARDAR ESTUDIANTE
============================================================ */

async function saveStudent() {

    if (!currentStudent) return;

    currentStudent.nameLower = (currentStudent.name || "").toLowerCase();

    let students = JSON.parse(localStorage.getItem("students") || "[]");
    const index = students.findIndex(s => Number(s.id) === Number(currentStudent.id));

    if (index !== -1) students[index] = currentStudent;
    else students.push(currentStudent);

    localStorage.setItem("students", JSON.stringify(students));
    localStorage.setItem("currentStudent", JSON.stringify(currentStudent));

    if (firebaseAvailable()) {
        try {
            await setDoc(
                doc(firebaseDB, "students", String(currentStudent.id)),
                currentStudent,
                { merge: true }
            );
        } catch (error) {
            console.error("Error guardando estudiante en Firestore:", error);
        }
    }
}


/* ============================================================
   VOLVER AL MENÚ
============================================================ */

document
    .getElementById(
        "backMenuBtn"
    )
    .addEventListener(
        "click",
        () => {


            updateStudentScreen();


            showScreen(
                screens.student
            );

        }
    );


/* ============================================================
   CONTINUAR DESPUÉS DEL RESULTADO
============================================================ */

document
    .getElementById(
        "continueBtn"
    )
    .addEventListener(
        "click",
        () => {


            updateStudentScreen();


            showScreen(
                screens.student
            );

        }
    );


/* ============================================================
   CERRAR SESIÓN ALUMNO
============================================================ */

document
    .getElementById(
        "studentLogout"
    )
    .addEventListener(
        "click",
        () => {


            currentStudent =
                null;


            localStorage.removeItem(
                "currentStudent"
            );


            document
                .getElementById(
                    "studentName"
                )
                .value = "";


            showScreen(
                screens.login
            );

        }
    );


/* ============================================================
   CERRAR SESIÓN PROFESOR
============================================================ */

document
    .getElementById(
        "teacherLogout"
    )
    .addEventListener(
        "click",
        () => {


            currentTeacher =
                null;

            if (firebaseAvailable()) {
                signOut(firebaseAuth).catch(error =>
                    console.error("Error cerrando sesión Firebase:", error)
                );
            }


            localStorage.removeItem(
                "currentTeacher"
            );


            document
                .getElementById(
                    "teacherUsername"
                )
                .value = "";


            document
                .getElementById(
                    "teacherPassword"
                )
                .value = "";


            showScreen(
                screens.login
            );

        }
    );


/* ============================================================
   RECUPERAR SESIÓN
============================================================ */

async function restoreSession() {

    const savedStudent = localStorage.getItem("currentStudent");

    if (savedStudent) {
        try {
            currentStudent = JSON.parse(savedStudent);
            if (!currentStudent.usedQuestions) {
                currentStudent.usedQuestions = { spelling: [], syllables: [], reading: [], dictation: [] };
            }
            if (!currentStudent.mistakes) currentStudent.mistakes = [];
            updateStudentScreen();
            showScreen(screens.student);
            return;
        } catch (error) {
            console.error("Error recuperando alumno:", error);
            localStorage.removeItem("currentStudent");
        }
    }

    showScreen(screens.login);
}


/* ============================================================
   RECUPERAR PROFESOR CON FIREBASE AUTHENTICATION
============================================================ */

if (firebaseAvailable()) {
    onAuthStateChanged(firebaseAuth, async user => {
        if (user) {
            try {
                const teacherSnap = await getDoc(
                    doc(firebaseDB, "teachers", user.uid)
                );

                if (teacherSnap.exists()) {
                    currentTeacher = {
                        uid: user.uid,
                        ...teacherSnap.data()
                    };
                    localStorage.setItem(
                        "currentTeacher",
                        JSON.stringify(currentTeacher)
                    );
                    await updateTeacherScreen();
                    showScreen(screens.teacher);
                    return;
                }
            } catch (error) {
                console.error("Error recuperando profesor desde Firebase:", error);
            }
        }

        currentTeacher = null;
        localStorage.removeItem("currentTeacher");

        // Si no hay profesor autenticado, conserva la sesión local del alumno.
        if (!currentStudent) {
            await restoreSession();
        }
    });
} else {
    restoreSession();
}