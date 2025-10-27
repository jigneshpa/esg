import { privateApiSlice } from '../api';

export const mediaApi = privateApiSlice.injectEndpoints({
  endpoints: build => ({
    getMediaLink: build.query({
      query: ({ name }) => ({
        url: `/v2/media/signed?key=${name}`,
        method: 'GET'
      })
    }),
    getMedia: build.query({
      query: key => ({
        url: `/media/${key}`,
        method: 'GET'
      })
    }),
    uploadFile: build.mutation({
      query: ({ file, signedUrl }) => ({
        url: signedUrl,
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })
    })
  })
});
