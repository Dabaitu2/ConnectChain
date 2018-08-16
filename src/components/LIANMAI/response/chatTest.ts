class Dialogue {
    dialogueId: Number;
    questionID: Number;
    answerer: Number;
    sourcesID: Number;
    content: [DialogueData];
    quizzerIsRead: Number;
    answererIsRead: Number;

    constructor() {

    }

}

class DialogueData {
    answer: Number;
    time: Date;
    isImg: Number;
    detail:String;
}