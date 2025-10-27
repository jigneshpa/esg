import { privateApiSlice } from '../api';

export const notificationApi = privateApiSlice.injectEndpoints({
  endpoints: build => ({
    deleteDeviceToken: build.mutation({
      query: data => ({
        url: `device-token/${data}`,
        method: 'DELETE'
      })
    }),
    /*Need to be rewrited use param */
    getNotifications: build.query({
      query: params => ({
        url: 'notification',
        params: { page: 1, max_results: 10, ...params }
      })
    }),
    getNotificationDetail: build.query({
      query: notificationId => ({
        url: `notification/${notificationId}`
      })
    }),
    getTotalNotificationUnread: build.query({
      query: () => 'notification/unread'
    }),
    postRemindUserMessage: build.mutation({
      query: data => ({
        url: 'notification/remindUserMessage',
        method: 'POST',
        body: data
      })
    }),
    sendNotification: build.mutation({
      query: data => ({
        url: 'notification/system',
        method: 'POST',
        body: data
      })
    })
  })
});
