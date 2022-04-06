import { rootApi } from './api'

export const visualGenerationsApi = rootApi.injectEndpoints({
  endpoints: builder => ({
    fetchFromImageCache: builder.mutation<
      any,
      { caption: string; cacheTag?: string; topK?: number }
    >({
      query: searchOptions => ({
        url: '/image/cache/lookup',
        method: 'POST',
        body: {
          ...searchOptions,
        },
      }),
    }),
  }),
})

export const { useFetchFromImageCacheMutation } = visualGenerationsApi
