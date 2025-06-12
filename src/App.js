import React, { useState, useEffect } from 'react';
import quizData from './smc_quiz_complet.json';
import './Quiz.css';
import quizData2 from './intrebari_SMC.json';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [pointsPerQuestion, setPointsPerQuestion] = useState([]);
  const [quizDB, setQuizDB] = useState(quizData);

  useEffect(() => {
    const shuffled = [...quizDB].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 25));
    console.log(quizData.length);
  }, [quizDB]);

  useEffect(() => {
    // Reset state when quizDB changes
    setAnswers({});
    setTextAnswers({});
    setSubmitted(false);
    setScore(0);
    setPointsPerQuestion([]);
  }
  , [quizDB]);

  // Handles checkbox selection for multi-select
  const handleChange = (qIndex, option) => {
    setAnswers(prev => {
      const prevAnswers = prev[qIndex] || [];
      let updatedAnswers;
      if (prevAnswers.includes(option)) {
        // Remove option
        updatedAnswers = prevAnswers.filter(ans => ans !== option);
      } else {
        // Add option
        updatedAnswers = [...prevAnswers, option];
      }
      return { ...prev, [qIndex]: updatedAnswers };
    });
  };

  // Handles text input changes
  const handleTextChange = (qIndex, value) => {
    setTextAnswers(prev => ({
      ...prev,
      [qIndex]: value
    }));
  };

  // Scoring: full points only if all correct and no wrong options selected
  const handleSubmit = () => {
    let totalScore = 0;
    const pointsArray = questions.map((q, i) => {
      const correctAnswers = Array.isArray(q.answer) ? q.answer : [q.answer];
      
      // Handle text answer questions
      if (!q.options || q.options.length === 0) {
        const userAnswer = textAnswers[i] || '';
        const isCorrect = correctAnswers.some(correctAns => 
          userAnswer.trim().toLowerCase() === correctAns.trim().toLowerCase()
        );
        const points = isCorrect ? 1 : 0;
        totalScore += points;
        return points;
      }
      
      // Handle multiple choice questions
      const selected = answers[i] || [];
      
      // If any wrong answer is selected, 0 points
      const anyWrong = selected.some(ans => !correctAnswers.includes(ans));
      if (anyWrong) {
        return 0;
      }

      // Partial credit: number of correct selected / total correct
      const correctSelected = selected.filter(ans => correctAnswers.includes(ans)).length;
      const points = correctAnswers.length > 0 ? correctSelected / correctAnswers.length : 0;

      totalScore += points;
      return points;
    });

    setScore(totalScore);
    setPointsPerQuestion(pointsArray);
    setSubmitted(true);
  };

  // Helper to check if an option is correct
  const isCorrectAnswer = (question, option) => {
    if (Array.isArray(question.answer)) {
      return question.answer.includes(option);
    }
    return question.answer === option;
  };

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">SMC Quiz</h1>
      <button className="switch-quiz-button" onClick={() => setQuizDB(quizDB === quizData ? quizData2 : quizData)}>
        {quizDB === quizData ? "Switch to SMC Quiz++" : "Switch to SMC Quiz"}
      </button>
      {!submitted ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {questions.map((q, index) => (
            <div key={index} className="question-block">
              <p className="question-text">{index + 1}. {q.question}</p>
              {q.image && (
                <img src={`${process.env.PUBLIC_URL}${q.image}`} alt={`Question ${index + 1}`} className="question-image" height={420} />
              )}
              
              {q.options && q.options.length > 0 ? (
                q.options.map((option, idx) => (
                  <div key={idx} className="option">
                    <label>
                      <input
                        type="checkbox"
                        name={`question-${index}`}
                        value={option}
                        checked={(answers[index] || []).includes(option)}
                        onChange={() => handleChange(index, option)}
                      />
                      {option}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-answer">
                  <input
                    type="text"
                    value={textAnswers[index] || ''}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    placeholder="Scrieți răspunsul aici..."
                  />
                </div>
              )}
            </div>
          ))}
          <div className="submit-container">
            <button type="submit" className="submit-button">Submit</button>
          </div>
        </form>
      ) : (
        <div>
          <div className="score-box">
            <p>Scor: <strong>{score.toFixed(2)}</strong> din 25</p>
            <p>Nota finală: <strong>{(score * 10 / 25).toFixed(2)}</strong></p>
          </div>
          {questions.map((q, index) => {
            const correctAnswers = Array.isArray(q.answer) ? q.answer : [q.answer];
            const selected = answers[index] || [];
            const userTextAnswer = textAnswers[index] || '';
            const missedAnswers = correctAnswers.filter(ans => !selected.includes(ans));
            const points = pointsPerQuestion[index];

            return (
              <div key={index} className="question-block">
                <p className="question-text">{index + 1}. {q.question}</p>
                {q.image && (
                <img src={`${process.env.PUBLIC_URL}${q.image}`} alt={`Question ${index + 1}`} className="question-image" height={420} style={{maxWidth: '100%'}} />
              )}
                
                {q.options && q.options.length > 0 ? (
                  q.options.map((option, idx) => {
                    const isCorrect = correctAnswers.includes(option);
                    const isSelected = selected.includes(option);
                    return (
                      <div key={idx} className="option">
                        <input
                          type="checkbox"
                          name={`result-${index}`}
                          checked={isSelected}
                          readOnly
                        />
                        <span className={
                          isCorrect ? "correct" : isSelected ? "incorrect" : ""
                        }>
                          {option} {isCorrect && <span className="checkmark">✔️</span>}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-answer-result">
                    <p><strong>Răspunsul tău:</strong> {userTextAnswer || "(lipsă)"}</p>
                    <p><strong>Răspuns corect:</strong> {correctAnswers.join(' sau ')}</p>
                    <p className={
                      correctAnswers.some(correctAns => 
                        userTextAnswer.trim().toLowerCase() === correctAns.trim().toLowerCase()
                      ) ? "correct" : "incorrect"
                    }>
                      {correctAnswers.some(correctAns => 
                        userTextAnswer.trim().toLowerCase() === correctAns.trim().toLowerCase()
                      ) ? "✓ Corect" : "✗ Incorect"}
                    </p>
                  </div>
                )}
                
                <p className="points-earned">
                  <strong>Puncte obținute:</strong> {points.toFixed(2)} / 1
                </p>
                
                {q.options && q.options.length > 0 && missedAnswers.length > 0 && (
                  <p className="missed-answers">
                    <strong>Răspunsuri corecte nealese:</strong> {missedAnswers.join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quiz;