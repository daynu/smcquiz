#check for duplicate objects in json file
#check question key
import json
def check_duplicate_questions(json_file):
    with open(json_file, 'r', encoding='utf-8') as file:
        data = json.load(file)

    questions = set()
    duplicates = []

    for item in data:
        question = item.get('question')
        if question:
            if question in questions:
                duplicates.append(question)
            else:
                questions.add(question)

    return duplicates

print(check_duplicate_questions('./smc_quiz_complet.json'))
   