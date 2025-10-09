// Netlify function for legal testimony preparation
exports.handler = async (event, context) => {
  // This is a placeholder for actual interview preparation logic
  // In a real implementation, this would connect to an AI service API
  // and provide personalized feedback on testimony responses
  
  const { httpMethod, body } = event;
  
  if (httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  const { questionType, userResponse, mode } = JSON.parse(body);
  
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real implementation, this would be personalized feedback from AI
  // based on the actual content of the user's response
  let feedback = '';
  let metrics = {};
  
  // Generate different feedback based on the testimony mode
  switch (mode) {
    case 'deposition':
      feedback = generateDepositionFeedback(questionType, userResponse);
      metrics = generateDepositionMetrics(questionType, userResponse);
      break;
    case 'direct':
      feedback = generateDirectExamFeedback(questionType, userResponse);
      metrics = generateDirectExamMetrics(questionType, userResponse);
      break;
    case 'cross':
      feedback = generateCrossExamFeedback(questionType, userResponse);
      metrics = generateCrossExamMetrics(questionType, userResponse);
      break;
    default:
      feedback = generateGeneralFeedback(questionType, userResponse);
      metrics = generateGeneralMetrics(questionType, userResponse);
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      success: true, 
      feedback: feedback,
      metrics: metrics
    })
  };
};

// Generate feedback for deposition testimony
function generateDepositionFeedback(questionType, userResponse) {
  switch (questionType) {
    case 'incident_description':
      return 'Your response provided a clear chronology of events, which is good. However, you included some speculation about the officer\'s intentions ("I think he was trying to intimidate me"). In a deposition, stick strictly to observable facts. Also, your answer was quite lengthy - remember that shorter answers are generally better in depositions. Only answer exactly what was asked.';
    
    case 'injury_description':
      return 'You effectively described your physical injuries and medical treatment. Good job providing specific details about healthcare providers and treatment dates. Be careful about attributing all your current symptoms directly to the incident without medical confirmation, as this could be challenged. Consider phrases like "Following the incident, I experienced..." rather than making causal claims.';
    
    case 'prior_incidents':
      return 'Your answer was appropriately direct and truthful. Good job acknowledging the prior incident while providing important context. Remember that in depositions, you should answer truthfully even when the information might seem unfavorable. However, avoid volunteering additional information beyond what was asked, as you did when mentioning your neighbor\'s similar experience.';
    
    default:
      return 'Your response was factual and straightforward, which is appropriate for deposition testimony. Remember to keep answers concise, stick to facts you personally observed, and avoid speculation or conclusions. If you don\'t know or don\'t remember something, it\'s perfectly acceptable to say so rather than guessing.';
  }
}

// Generate metrics for deposition testimony
function generateDepositionMetrics(questionType, userResponse) {
  return {
    clarity: 85,
    factualAccuracy: 92,
    conciseness: 68,
    composure: 78,
    consistency: 90,
    improvements: [
      "Keep answers more concise",
      "Avoid speculating about others' intentions",
      "Don't volunteer information beyond what was asked",
      "Use 'I don't recall' when appropriate rather than guessing"
    ]
  };
}

// Generate feedback for direct examination testimony
function generateDirectExamFeedback(questionType, userResponse) {
  switch (questionType) {
    case 'incident_narrative':
      return 'Your testimony effectively communicated the key events in a chronological order that jurors can follow. You included sensory details that help make your experience relatable. To improve, consider using more everyday language instead of technical terms - for example, say "bruise" instead of "contusion." Also, make more eye contact with the jury rather than just your attorney. Your emotional response seemed authentic without being overly dramatic, which is effective.';
    
    case 'injury_impact':
      return 'You provided compelling testimony about how your injuries affected your daily life. The specific examples about being unable to hold your child and missing important family events were particularly effective. Consider adding more details about your emotional state and how the injuries affected your relationships. When describing pain, use analogies or scale (1-10) to help jurors understand your experience. Remember to look at jurors when describing the most significant impacts.';
    
    case 'long_term_effects':
      return 'Your description of long-term effects was clear and impactful. The ongoing physical limitations and emotional trauma were well articulated. However, be careful not to appear rehearsed - some of your phrasing sounded memorized rather than conversational. Also, when discussing medical treatments, explain terms that jurors might not understand. Your description of how the incident changed your outlook on law enforcement was powerful but could benefit from a specific example.';
    
    default:
      return 'Your testimony was generally effective for direct examination. You connected with the jury through relatable examples and showed appropriate emotion. Remember to use plain language that jurors will understand, maintain eye contact with the jury box, and provide specific examples that illustrate your points. Avoid appearing rehearsed by using more conversational language.';
  }
}

// Generate metrics for direct examination testimony
function generateDirectExamMetrics(questionType, userResponse) {
  return {
    clarity: 88,
    juryConnection: 75,
    emotionalImpact: 82,
    credibility: 90,
    narrativeStrength: 85,
    improvements: [
      "Use more everyday language instead of technical terms",
      "Increase eye contact with jurors",
      "Add more sensory details to key moments",
      "Vary speech pattern to sound more conversational"
    ]
  };
}

// Generate feedback for cross examination testimony
function generateCrossExamFeedback(questionType, userResponse) {
  switch (questionType) {
    case 'compliance_question':
      return 'You handled this challenging question well by acknowledging the delay in compliance while providing important context. Your tone remained respectful rather than argumentative, which is crucial on cross-examination. However, your answer was longer than necessary - on cross, shorter answers are almost always better. A simple "Yes, after I asked why I was being stopped" would have been sufficient. Remember that elaborating gives opposing counsel more material to work with.';
    
    case 'medical_timing':
      return 'Your explanation for the delay in seeking medical attention was reasonable, but you became slightly defensive in your tone. On cross-examination, maintaining a calm, matter-of-fact demeanor is essential. Also, your answer included unnecessary details about your insurance situation that weren\'t asked about. When facing questions that suggest inconsistency, provide brief context without appearing evasive, but don\'t volunteer additional information.';
    
    case 'prior_complaints':
      return 'You answered truthfully about your prior complaint, which is essential. However, you became visibly frustrated when distinguishing between the situations, which can appear defensive to jurors. When facing questions about prior similar actions, acknowledge them calmly and, if appropriate, briefly note relevant differences without appearing argumentative. Remember that your demeanor is as important as your words during cross-examination.';
    
    default:
      return 'On cross-examination, you generally maintained composure while answering directly. Remember that brief, straightforward answers are usually best. Avoid qualifying your answers unless absolutely necessary, and resist the urge to explain or justify unless specifically asked. Maintain a respectful tone even when questions seem designed to provoke you, and don\'t argue with opposing counsel.';
  }
}

// Generate metrics for cross examination testimony
function generateCrossExamMetrics(questionType, userResponse) {
  return {
    composure: 78,
    conciseness: 65,
    consistency: 88,
    credibility: 82,
    defensiveness: 35, // Lower is better
    improvements: [
      "Keep answers shorter and more direct",
      "Maintain calm demeanor even with provocative questions",
      "Don't volunteer information beyond what was asked",
      "Avoid justifying or explaining unless specifically asked"
    ]
  };
}

// Generate general feedback
function generateGeneralFeedback(questionType, userResponse) {
  return 'Your response demonstrated good knowledge of the facts and maintained appropriate tone. When testifying, remember to speak clearly, answer only what was asked, and maintain consistent eye contact. If you don\'t understand a question, ask for clarification rather than guessing what was meant. Your credibility depends on both what you say and how you say it, so maintain a composed demeanor throughout questioning.';
}

// Generate general metrics
function generateGeneralMetrics(questionType, userResponse) {
  return {
    clarity: 80,
    factualAccuracy: 85,
    composure: 75,
    credibility: 82,
    improvements: [
      "Maintain consistent eye contact",
      "Ask for clarification when needed",
      "Speak at a measured pace",
      "Review key facts before testimony"
    ]
  };
}