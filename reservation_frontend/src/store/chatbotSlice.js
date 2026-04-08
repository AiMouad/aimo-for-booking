import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatbotAPI } from '../services/api';

export const sendChatMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async ({ message, sessionId }, { rejectWithValue }) => {
    try {
      const { data } = await chatbotAPI.chat({ question: message, session_id: sessionId });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to send message.');
    }
  }
);

export const fetchSuggestions = createAsyncThunk(
  'chatbot/fetchSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await chatbotAPI.suggest();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState: {
    messages: [],
    sessionId: null,
    isOpen: false,
    isLoading: false,
    error: null,
    suggestions: [],
    aiPowered: false,
  },
  reducers: {
    toggleChat: (state) => { state.isOpen = !state.isOpen; },
    openChat: (state) => { state.isOpen = true; },
    closeChat: (state) => { state.isOpen = false; },
    addUserMessage: (state, { payload }) => {
      state.messages.push({
        id: Date.now(),
        role: 'user',
        content: payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearMessages: (state) => {
      state.messages = [];
      state.sessionId = null;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.sessionId = payload.session_id;
        state.aiPowered = payload.ai_powered;
        state.messages.push({
          id: Date.now(),
          role: 'assistant',
          content: payload.answer,
          data: payload.data,
          dataType: payload.data_type,
          actionRequired: payload.action_required,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendChatMessage.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        state.messages.push({
          id: Date.now(),
          role: 'assistant',
          content: '❌ Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(fetchSuggestions.fulfilled, (state, { payload }) => {
        state.suggestions = payload.data || [];
      });
  },
});

export const {
  toggleChat, openChat, closeChat,
  addUserMessage, clearMessages, clearError
} = chatbotSlice.actions;
export default chatbotSlice.reducer;
