const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @desc    Get messages for a conversation
// @route   GET /api/messages/:id
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    await Message.updateMany(
      { conversationId: req.params.id, receiverId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({
      conversationId: req.params.id,
      deletedBy: { $ne: req.user.id }
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages/:id
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const receiverId = req.params.id; // user id to send to
    const senderId = req.user.id;

    // Find if conversation exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      message,
    });

    await newMessage.save();

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message,
      $pull: { deletedBy: senderId }
    });
    await Conversation.findByIdAndUpdate(conversation._id, {
      $pull: { deletedBy: receiverId }
    });

    // Socket.io functionality to be added here

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get or create conversation without message
// @route   POST /api/messages/conversation/get-or-create/:id
// @access  Private
exports.getOrCreateConversation = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId]
      });
    } else {
      // If conversation was soft-deleted by sender, restore it
      if (conversation.deletedBy.includes(senderId)) {
        conversation = await Conversation.findByIdAndUpdate(
          conversation._id,
          { $pull: { deletedBy: senderId } },
          { new: true }
        );
      }
    }

    res.status(200).json({ conversationId: conversation._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
      deletedBy: { $ne: req.user.id }
    })
      .populate('participants', 'name email')
      .sort({ updatedAt: -1 });

    const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        receiverId: req.user.id,
        isRead: false
      });
      return { ...conv._doc, unreadCount };
    }));

    res.json(conversationsWithUnread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get total unread messages count for a user
// @route   GET /api/messages/unread-total
// @access  Private
exports.getUnreadTotal = async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiverId: req.user.id,
      isRead: false
    });
    res.json({ unreadTotal: unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark conversation as read
// @route   PUT /api/messages/read/:id
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { conversationId: req.params.id, receiverId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete (or soft delete) a conversation
// @route   PUT /api/messages/conversation/:id/delete
// @access  Private
exports.deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    // Add user to deletedBy for all messages
    await Message.updateMany(
      { conversationId: conversation._id },
      { $addToSet: { deletedBy: req.user.id } }
    );

    // Add user to deletedBy for conversation
    if (!conversation.deletedBy.includes(req.user.id)) {
      conversation.deletedBy.push(req.user.id);
    }
    
    // Cleanup logic: if both participants deleted it
    if (conversation.deletedBy.length === 2) {
      await Message.deleteMany({ conversationId: conversation._id });
      await Conversation.findByIdAndDelete(conversation._id);
    } else {
      await conversation.save();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
