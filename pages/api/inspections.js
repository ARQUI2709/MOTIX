import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { data, error } = await supabase
        .from('inspections')
        .insert([req.body])
        .select()

      if (error) throw error

      res.status(200).json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  } else if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      res.status(200).json({ success: true, data })
    } catch (error) {
      res.status(400).json({ success: false, error: error.message })
    }
  }
}