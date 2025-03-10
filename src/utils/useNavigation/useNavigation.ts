import { useRouter } from 'vue-router'

export default function useNavigation() {
  const router = useRouter()

  function goToShowDetails(showId: number, closeDropdown?: () => void) {
    router.push(`/show/${showId}`)
    if (closeDropdown) closeDropdown()
  }

  return { goToShowDetails }
}
