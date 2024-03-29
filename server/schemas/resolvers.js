const { User, Book } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

//---------------------------------------------------- QUERY -----------------------------
const Resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if(context.user) {
        const foundUser = await User.findOne({
            _id: context.user._id 
      });

      if (!foundUser) {
        return { message: '400 ERROR: Could not found the user id!' };
      }
      return foundUser;

    } else {
      throw AuthenticationError;

    }
  }
},

  Mutation: {
    //------------------- This related to login form and helps to login user------------------------------
    login: async (parent, { email, password }) => {
      try {
  const user = await User.findOne({ email });// find by email
  if (!user) {
    throw AuthenticationError;
  };

  const correctPw = await user.isCorrectPassword(password);

  if (!correctPw) {
    throw AuthenticationError;
  }
  const token = signToken(user);
  return { token, user };
} catch (error) {
  console.log(error);
  return { message: '400 ERROR', error };
}
    },
// --------------------------- This part goes to sign up page and creates user ------------------------
addUser: async (parent, { username, email, password }) => {
  try {
    const user = await User.create({ username, email, password });
    if (!user) {
      return { message: '400 ERROR, Something is wrong!' };
    }
    const token = signToken(user);
    return { token, user };
  } catch (error) {
    console.log(error);
    return { message: '400 ERROR', error };
  }
},
  //------------------------------- This part helps to remove book----------------------------
  removeBook: async (parent, { bookId }, { user }) => {
    console.log(bookId)
    try {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        return { message: "Couldn't find user with this id!" };
      }
      return updatedUser;
    } catch (error) {
      console.log(error);
      return { message: '400 ERROR', error };
    }
  },
    // ------------------------ Saving books------------------------------
    savedBook: async (parent, { bookInput }, context) => {
      if(context.user){
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookInput } },
          { new: true, runValidators: true }
        );
        return updatedUser;

      } else {
        throw AuthenticationError;
  
      }
    },
  },
};
module.exports = Resolvers;