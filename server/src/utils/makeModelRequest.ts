/* eslint-disable no-console */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

import axios from 'axios'
import { config } from 'dotenv'
config()

//Model Request using the Hugging Face API (models can be found at -> https://huggingface.co/models)
export async function makeModelRequest(
  inputs,
  model,
  parameters = {},
  options = { use_cache: false, wait_for_model: true }
) {
  try {
    console.log('inputs:', inputs)
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs, parameters, options },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
      }
    )
    return { success: true, data: response.data }
  } catch (err) {
    console.error(err)
    return { success: false, data: undefined }
  }
}
