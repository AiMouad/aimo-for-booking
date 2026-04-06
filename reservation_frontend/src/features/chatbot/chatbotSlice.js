import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatbotService from '../../services/chatbot.service';

// Async thunks
export const sendMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async ({ message, sessionId }, { rejectWithValue }) => {
    try {
      const response = await chatbotService.sendMessage(message, sessionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to send message');
    }
  }
);

export const createNewSession = createAsyncThunk(
  'chatbot/createNewSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatbotService.createSession();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create session');
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  'chatbot/fetchChatHistory',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await chatbotService.getChatHistory(sessionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch chat history');
    }
  }
);

// Slice
const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState: {
    currentSession: null,
    messages: [],
    isTyping: false,
    isLoading: false,
    error: null,
    sessions: [],
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isTyping = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isTyping = false;
        state.messages.push({
          id: Date.now(),
          role: 'user',
          content: action.meta.arg.message,
          timestamp: new Date().toISOString(),
        });
        state.messages.push({
          id: Date.now() + 1,
          role: 'assistant',
          content: action.payload.reply,
          timestamp: new Date().toISOString(),
          recommendations: action.payload.recommendations,
        });
        state.currentSession = { id: action.payload.session_id };
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isTyping = false;
        state.error = action.payload;
      })
      // Create new session
      .addCase(createNewSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createNewSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
        state.messages = [];
      })
      .addCase(createNewSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch chat history
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.messages = action.payload.messages || [];
        state.currentSession = action.payload.session;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { addMessage, clearMessages, setTyping, clearError } = chatbotSlice.actions;
export default chatbotSlice.reducer;
