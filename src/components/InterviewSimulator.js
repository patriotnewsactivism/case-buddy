import React, { useState } from 'react';
import { Mic, Square, Send, ChevronRight, AlertCircle, CheckCircle, Loader2, MessageSquare, Gavel } from 'lucide-react';

const InterviewSimulator = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(35);
  const [mode, setMode] = useState('deposition'); // 'deposition', 'direct', 'cross'
  
  // Legal-specific interview questions
  const questions = {
    deposition: [
      {
        id: 1,
        type: "Deposition Preparation",
        question: "Describe your recollection of the events that occurred on June 15, 2025, regarding the alleged use of excessive force.",
        tips: "Be truthful and precise. Stick to facts you personally observed. Avoid speculation or hearsay. If you don't recall something, say so directly."
      },
      {
        id: 2,
        type: "Deposition Preparation",
        question: "What specific injuries did you sustain as a result of the incident, and what medical treatment did you receive?",
        tips: "Be specific about each injury. Mention all healthcare providers seen. Describe how injuries affected daily activities. Avoid exaggeration."
      },
      {
        id: 3,
        type: "Deposition Preparation",
        question: "Have you ever been involved in any other lawsuits or made similar claims in the past?",
        tips: "Answer truthfully even if unfavorable. Opposing counsel likely has this information. Provide context if necessary. Don't volunteer additional information."
      }
    ],
    direct: [
      {
        id: 1,
        type: "Direct Examination",
        question: "Could you please tell the jury, in your own words, what happened on the evening of June 15, 2025?",
        tips: "Speak clearly and conversationally. Make eye contact with jurors. Use chronological order. Include sensory details that support your case."
      },
      {
        id: 2,
        type: "Direct Examination",
        question: "How did the officer's actions affect you physically and emotionally?",
        tips: "Be authentic about impact. Describe specific limitations. Connect injuries to daily life challenges. Avoid appearing rehearsed."
      },
      {
        id: 3,
        type: "Direct Examination",
        question: "What has been the long-term impact of this incident on your life?",
        tips: "Discuss ongoing medical issues. Mention psychological effects. Explain changes to work, relationships, and activities. Be specific but not dramatic."
      }
    ],
    cross: [
      {
        id: 1,
        type: "Cross Examination",
        question: "Isn't it true that you failed to immediately comply with the officer's instructions?",
        tips: "Stay calm and don't get defensive. Address the question directly. Provide context if necessary. Don't argue with the questioner."
      },
      {
        id: 2,
        type: "Cross Examination",
        question: "You've testified that you were injured, but you didn't seek medical attention until the next day, correct?",
        tips: "Explain timing without being defensive. Provide reasons for delay if applicable. Stay focused on facts. Maintain composure."
      },
      {
        id: 3,
        type: "Cross Examination",
        question: "You've made similar complaints against police officers in the past, haven't you?",
        tips: "Answer truthfully. Distinguish between situations if possible. Don't show frustration. Keep answers brief and to the point."
      }
    ]
  };
  
  const currentQuestions = questions[mode];
  
  const startRecording = () => {
    setIsRecording(true);
    setFeedback('Recording started. Please verbalize your response as if you were in a real legal proceeding...');
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    setFeedback('Analyzing your response with AI...');
    setTimeout(() => {
      if (mode === 'deposition') {
        setFeedback('Your response was appropriately detailed and factual. Good job avoiding speculation. Consider being more concise with your answers and only answering exactly what was asked. Remember that in a deposition, less is often more.');
      } else if (mode === 'direct') {
        setFeedback('You provided a clear narrative that jurors could follow. Good use of specific details. To improve, consider adding more sensory details and emotional impact where appropriate. Remember to speak to the jury, not just your attorney.');
      } else {
        setFeedback('You maintained composure well under challenging questions. Good job not arguing with counsel. Remember to keep answers brief on cross-examination and avoid volunteering information not specifically requested.');
      }
      setProgress(progress + 15);
    }, 2000);
  };
  
  const nextQuestion = () => {
    setCurrentQuestion((prev) => (prev + 1) % currentQuestions.length);
    setUserResponse('');
    setFeedback('');
  };
  
  const submitResponse = () => {
    setFeedback('Analyzing your written response with AI...');
    setTimeout(() => {
      if (mode === 'deposition') {
        setFeedback('Your written response shows good attention to detail. Be careful about including speculation in your third paragraph. In a deposition, stick strictly to facts you personally observed and avoid drawing conclusions.');
      } else if (mode === 'direct') {
        setFeedback('Your testimony effectively communicates the key points. Consider using more accessible language for the jury. Technical terms like "contusion" could be replaced with "bruise" for better understanding.');
      } else {
        setFeedback('Your response to this challenging question was factual but perhaps too detailed. On cross-examination, shorter answers are generally better. "Yes," "No," or brief explanations reduce opportunities for follow-up attacks.');
      }
      setProgress(progress + 10);
    }, 2000);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Gavel className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="font-semibold text-xl text-gray-900">Legal Testimony Simulator</h3>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setMode('deposition')} 
            className={`px-3 py-1 rounded-md text-sm ${mode === 'deposition' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Deposition
          </button>
          <button 
            onClick={() => setMode('direct')} 
            className={`px-3 py-1 rounded-md text-sm ${mode === 'direct' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Direct Exam
          </button>
          <button 
            onClick={() => setMode('cross')} 
            className={`px-3 py-1 rounded-md text-sm ${mode === 'cross' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Cross Exam
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Preparation Progress</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <span className={`px-3 py-1 rounded-full text-sm ${
            mode === 'deposition' ? 'bg-blue-100 text-blue-800' : 
            mode === 'direct' ? 'bg-green-100 text-green-800' : 
            'bg-orange-100 text-orange-800'
          }`}>
            {currentQuestions[currentQuestion].type}
          </span>
          <span className="text-gray-500 text-sm">
            Question {currentQuestion + 1} of {currentQuestions.length}
          </span>
        </div>
        
        <div className="flex items-start mb-3">
          <MessageSquare className="w-5 h-5 text-gray-700 mr-2 mt-1 flex-shrink-0" />
          <h4 className="text-lg font-medium text-gray-900">
            {currentQuestions[currentQuestion].question}
          </h4>
        </div>
        
        <div className="p-3 bg-blue-100 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-800 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-blue-800 text-sm">
              <span className="font-semibold">Attorney Tip:</span> {currentQuestions[currentQuestion].tips}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Your Response</label>
        <textarea
          value={userResponse}
          onChange={(e) => setUserResponse(e.target.value)}
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Type your response here or use voice recording..."
        />
      </div>
      
      <div className="flex flex-wrap gap-3 mb-4">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
          >
            <Mic className="w-4 h-4 mr-2" />
            <span>Start Voice Recording</span>
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors flex items-center"
          >
            <Square className="w-4 h-4 mr-2" />
            <span>Stop Recording</span>
          </button>
        )}
        
        <button 
          onClick={submitResponse}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Written Response
        </button>
        
        <button 
          onClick={nextQuestion}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
        >
          <ChevronRight className="w-4 h-4 mr-2" />
          Next Question
        </button>
      </div>
      
      {feedback && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 mb-1">AI Feedback:</p>
              <p className="text-green-800">{feedback}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Clarity</div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="text-sm font-medium">85%</span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Factual Accuracy</div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <span className="text-sm font-medium">92%</span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Composure</div>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <span className="text-sm font-medium">78%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulator;