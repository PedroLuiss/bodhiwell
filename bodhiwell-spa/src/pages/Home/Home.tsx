import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  MediaShowcase,
  HeroSection,
  ProfessionalsSection,
  HolisticSearch,
  ReserveNow,
  StepsProcessSection
  , ActionIntroSection,
  NewsSection,
  NewsletterSubscription,
  EvolutionarySection,
  ManifestoSection,
  TeamSection
} from "../../components/Landing";
import { useHome } from './hooks/useHome';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  
  const { container } = useHome();

  return (
    <div className="home" ref={container}>
      <HeroSection />
      <EvolutionarySection/>
      <MediaShowcase />
      <ManifestoSection />
      <HolisticSearch />
      <StepsProcessSection />
      <ProfessionalsSection />
      <ReserveNow />
      <TeamSection />
      <NewsSection />
      <ActionIntroSection />
      <NewsletterSubscription />
    </div>
  );
};
export default Home;