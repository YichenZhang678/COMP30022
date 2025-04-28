import { getQuestionsDbName } from "../../utils/functions/dbName.js";
import askGemini from "../../service/askGemini.js";
import questionService from "../../service/questions/questionsService.js";
import httpCodes from "../../utils/constants/httpsCodes.js";
import { PythonShell } from 'python-shell';

// Uses askGemini to generate a question based on the topic and context
const questionController = {
  // Generates a question based on the topic and context provided
  // Request: { topic, context }
  // Response: { success, message }
  generateQuestion: async (req, res) => {
    try {
      const { topic, context, userID, regeneration } = req.query; // Destructure the topic and context from req.body
      if (!topic || !context) {
        return res.status(httpCodes.BAD_REQUEST).json({
          success: false,
          message: "Please provide a topic and context"
        })
      }
    
      const questionsDbName = await getQuestionsDbName();
      
      // Generate a new question ID
      const questionID = await questionService.generateNewQuestionID(questionsDbName);
      if (!questionID) {
        return res.status(httpCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Error generating new question ID"
        });
      }
      
      // ask Gemini for a question
      const question = await askGemini(topic, context, userID, regeneration);
      if (!question.success) {
        return res.status(httpCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Error asking Gemini"
        });
      }

      // save this question to the database as a fresh, no analytics question
      const saveResult = await questionService.createNewQuestion(questionID, topic, context, questionsDbName);
      if (!saveResult.success) {
        return res.status(httpCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Error saving a new question"
        });
      }
  
      return res.status(httpCodes.OK).json({
        success: true,
        message: "Question generated successfully",
        questionID: questionID,
        question: question.fixed_resp
      });

    } catch (e) {
      console.error("Error generating question:", e);
      return res.status(httpCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: e.message
      });
    }
  },

  // Runs the Python code by the user
  runPython: async (req, res) => {
    const { pythonCode } = req.body;
    if (!pythonCode) {
      return res.status(httpCodes.BAD_REQUEST).json({
        success: false,
        message: "Please provide Python code to run"
      });
    }
  
    // Options for PythonShell
   //let options = {
    //  mode: 'text',
    //  pythonPath: './venv/Scripts/python', // Change to 'python3' if needed
    //  pythonOptions: ['-u'],
    //  scriptPath: './'
    //};
  
    // Run the Python code
    PythonShell.runString(pythonCode) 
      .then(messages => {
        messages = messages.join("\r\n");
        res.status(httpCodes.OK).json({ 
          success: true,
          message: "Python code executed successfully",
          output: messages 
        }); // Send the output back to the client
      }).catch(e => {
        res.status(httpCodes.INTERNAL_SERVER_ERROR).json({ 
          success: false,
          message: "Error executing Python code",
          error: e.message 
        }); // Send any errors back to the client
      }
    );
  },

  // Updates the question details based on the user's attempt
  // Request: { questionID, time, correct }
  // Response: { success, message }
  updateQuestionDetails: async (req, res, next) => {
    try {
      const { questionID, time, correct } = req.body; // Destructure the questionID, time and correct from req.body
      if (!questionID || time === undefined || correct === undefined) {
        return res.status(httpCodes.BAD_REQUEST).json({
          success: false,
          message: "Please provide a questionID, time and correct"
        });
      }
    
      const questionsDbName = await getQuestionsDbName();
    
      const updateResult = await questionService.updateQuestionDetails(questionID, time, correct, questionsDbName);
      if (!updateResult.success) {
        return res.status(httpCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: updateResult.message
        });
      }
      // next one in the middleware chain (this is actually a middleware!)
      return next();

    } catch (e) {
      console.error("Error updating question details:", e);
      return res.status(httpCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: e.message
      });
    }
  },
}

export default questionController;
