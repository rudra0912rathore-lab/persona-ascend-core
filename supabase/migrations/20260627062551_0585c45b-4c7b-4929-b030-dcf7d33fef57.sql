
-- Lock down SECURITY DEFINER functions so they aren't broadly executable by signed-in users.

-- 1) complete_challenge: only updates the caller's own rows via auth.uid().
--    Switch to SECURITY INVOKER so RLS on profiles/challenges enforces access naturally.
CREATE OR REPLACE FUNCTION public.complete_challenge(_challenge_id uuid)
 RETURNS profiles
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
DECLARE
  c public.challenges%ROWTYPE;
  p public.profiles%ROWTYPE;
  new_xp INTEGER;
  new_level INTEGER;
  today DATE := (now() AT TIME ZONE 'utc')::date;
  new_streak INTEGER;
BEGIN
  SELECT * INTO c FROM public.challenges WHERE id = _challenge_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'challenge not found'; END IF;
  IF c.completed_at IS NOT NULL THEN
    SELECT * INTO p FROM public.profiles WHERE id = auth.uid();
    RETURN p;
  END IF;

  UPDATE public.challenges SET completed_at = now() WHERE id = _challenge_id;

  SELECT * INTO p FROM public.profiles WHERE id = auth.uid();
  new_xp := p.xp + c.xp_reward;
  new_level := GREATEST(1, 1 + (new_xp / 250));

  IF p.last_active_date IS NULL THEN
    new_streak := 1;
  ELSIF p.last_active_date = today THEN
    new_streak := p.streak;
  ELSIF p.last_active_date = today - INTERVAL '1 day' THEN
    new_streak := p.streak + 1;
  ELSE
    new_streak := 1;
  END IF;

  UPDATE public.profiles
  SET xp = new_xp,
      level = new_level,
      streak = new_streak,
      longest_streak = GREATEST(longest_streak, new_streak),
      last_active_date = today
  WHERE id = auth.uid()
  RETURNING * INTO p;

  RETURN p;
END $function$;

REVOKE ALL ON FUNCTION public.complete_challenge(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_challenge(uuid) TO authenticated, service_role;

-- 2) handle_new_user: trigger on auth.users; must stay SECURITY DEFINER but never called directly.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 3) touch_updated_at: trigger helper; not meant to be invoked directly.
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- 4) has_role: needed by RLS policies. Keep SECURITY DEFINER, revoke from PUBLIC/anon,
--    keep EXECUTE for authenticated since policies evaluate as the calling user.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
