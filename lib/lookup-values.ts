'use server'

import { getSchemaToUse } from '@/utils/schemToUse'
import { createClient } from '@/utils/supabase/server'

export async function getTradingBranches() {
  const supabase = await createClient()
  const schema = await getSchemaToUse()

  const { data, error } = await supabase

    .schema(schema)
    .from('tblFCU_TradingBranches')
    .select('*')

  if (!data) return

  return data
}
