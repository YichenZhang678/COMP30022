import QuestionSchema from "../../model/questions/questionModel.js";
import { getDatabaseConnection } from "../../connection.js";
import dotenv from 'dotenv'
dotenv.config();


const getQuestionModel = async (questionsDbName) => {
  const questionCollection = process.env.QUESTION_DETAILS_COLLECTION;
  if (!questionCollection) {
    throw new Error("Question collection is not defined in env file");
  }
  const dbConnection = await getDatabaseConnection(questionsDbName);
  return dbConnection.model(questionCollection, QuestionSchema);
}

// Contains all methods communicating with the question collection
const questionRepo = {
  // -------------------------------------FOR ADMIN ANALYTICS-------------------------------------
  getTotalNumQuestions: async (questionsDbName) => { 
    try {
      const questionModel = await getQuestionModel(questionsDbName);
      return await questionModel.countDocuments();
    } catch (e) {
      console.error("Error getting total number of questions:", e);
      throw e;
    }
  },

  getTotalAccuracy: async (questionsDbName, totalQuestions) => {
    try {
      const questionModel = await getQuestionModel(questionsDbName);
      const numCorrect = await questionModel.countDocuments({ correct: true });
      // calculate accuracy as a percentage
      const accuracy = (totalQuestions > 0)
        ? Math.round((numCorrect / totalQuestions) * 100 * 100) / 100
        : 0;
      return accuracy;
    } catch (e) {
      console.error("Error calculating total accuracy:", e);
      throw e;
    }
  },


  getTopicsAnalytics: async (questionsDbName) => {
    try {
      const questionModel = await getQuestionModel(questionsDbName);
      const result = await questionModel.aggregate([
        {
          $group: {
            // group attempts by topic
            _id: "$topic",
            numQuestions: { $sum: 1 }, // num of questions in this topic
            correctQuestions: {
              $sum: {
                $cond: [{ $eq: ["$correct", true] }, 1, 0] // counts how many correct questions there are
              }
            }
          }
        },
        {
          // project is what we want to show / return, here: topic, numQuestions, accuracy
          $project: {
            topic: "$_id",
            numQuestions: 1,
            accuracy: {
              $cond: [
                { $eq: ["$numQuestions", 0] }, 0,
                { $round: [{$multiply: [{ $divide: ["$correctQuestions", "$numQuestions"] }, 100] }, 2]} // percentage
              ]
            }
          }
        }
      ])
      return result;
    } catch (e) {
      console.error("Error getting topics analytics:", e);
      throw e;
    }
  },

  // -------------------------------------FOR USER ANALYTICS-------------------------------------
  // Finds and returns the question with this questionID
  getQuestionDetailsFromArray: async (questionIDArray, questionsDbName) => {
    try {
      const questionModel = await getQuestionModel(questionsDbName);
      return await questionModel.find({
        questionID: { $in: questionIDArray },
      });
    } catch (e) {
      console.error("Error getting question details:", e);
      throw e;
    }
  },

  // -------------------------------------UPDATES-------------------------------------

  // returns the new question ID for this question (number of questions already saved + 1)
  generateNewQuestionID: async (questionsDbName) => {
    try {
      const questionModel = await getQuestionModel(questionsDbName);
      const numQuestions = await questionModel.countDocuments();
      return numQuestions + 1;
    } catch (e) {
      console.error("Error generating new question ID:", e);
      throw e;
    }
  },

  // saves a new question with this questionID, topic, and context
  createNewQuestion: async (questionID, topic, context, questionsDbName) => {
    try {
      const questionModel = await getQuestionModel(questionsDbName);
      const newQuestion = new questionModel({
        questionID: questionID,
        topic: topic,
        context: context,
      });
      // since default values are added to the model, we don't need to add them here
      return await newQuestion.save();
    } catch (e) {
      console.error("Error saving the question:", e);
      throw e;
    }
  },

  // returns the new attempt ID for this question (number of attempts already made + 1)
  generateNewAttemptID: async (questionID, questionsDbName) => {
    try {
      const questionModel = await getQuestionModel(questionsDbName);
      const question = await questionModel.findOne({ questionID: questionID });
      return question.attempts.length + 1;
    } catch (e) {
      console.error("Error generating new attempt ID:", e);
      throw e;
    }
  },

  // Updates the details of the question with this questionID
  updateQuestionDetails: async (attemptID, questionID, time, correct, questionsDbName) => {
    try {
      const questionModel = await getQuestionModel(questionsDbName);
      // Only updates the fields that are present in updatedDetails
      return await questionModel.updateOne(
        // find the question with this questionID to update
        { questionID: questionID },
        { 
          // increase the number of attempts by 1, add the time to the total time
          $inc: {
            numAttempts: 1,
            totalTime: time,
          }, 
          $max: {
            correct: correct, // makes it so it only updates if correct is true, and never updates if correct is false
          },
          // add the attempt deatils, which contains attemptID, time, and correctness to the list of attempts
          $push: {
            attempts: {
              attemptID: attemptID,
              time: time,
              correct: correct,
            }
          }
        }
      );
    } catch (e) {
      console.error("Error updating question details:", e);
      throw e;
    }
  },
}

export default questionRepo;