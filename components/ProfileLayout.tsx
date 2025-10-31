import { ProfileDetail } from "./ProfileDetail";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart, MessageCircle, Share2, Flag, Star } from "lucide-react";

interface ProfileLayoutProps {
  profileId: string;
  onMessageClick?: (profileId: string) => void;
  userType?: 'family' | 'aupair';
}

// Mock data - in a real app, this would come from an API
const getProfileData = (id: string, userType?: 'family' | 'aupair') => {
  // Handle "me" - current user profile
  if (id === 'me') {
    if (userType === 'family') {
      return {
        type: 'family' as const,
        id: 'me',
        name: 'The Johnson Family',
        location: 'San Francisco, CA',
        flag: '🇺🇸',
        imageUrl: 'https://images.unsplash.com/photo-1624448445915-97154f5e688c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGZhbWlseSUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTc3NDg5OXww&ixlib=rb-4.1.0&q=80&w=1080',
        children: [
          { age: 7, emoji: '👧' },
          { age: 4, emoji: '👦' }
        ],
        stayDuration: '12 months',
        hoursPerWeek: '25 hours',
        languages: ['English'],
        lookingFor: [
          'Swimming instructor for kids',
          'Help with cooking and meal prep',
          'Cultural exchange enthusiast',
          'Patient and energetic',
          'Loves outdoor activities'
        ],
        aboutUs: 'We are an active family living in San Francisco. We love outdoor activities, cultural exchange, and want to provide our children with diverse experiences. We are looking forward to welcoming an au pair into our home!'
      };
    } else {
      return {
        type: 'aupair' as const,
        id: 'me',
        name: 'Emma Johnson',
        age: 24,
        country: 'United States',
        flag: '🇺🇸',
        currentLocation: 'San Francisco, CA',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
        languages: [
          { name: 'English', level: 'Native' },
          { name: 'French', level: 'Intermediate' }
        ],
        education: [
          'Early Childhood Education',
          'Childcare experience (3 years)',
          'CPR and First Aid certified'
        ],
        skills: [
          { emoji: '🏊', name: 'Swimming', description: 'Certified instructor' },
          { emoji: '🎨', name: 'Art', description: 'Teaching & crafts' },
          { emoji: '🍳', name: 'Cooking' },
          { emoji: '📚', name: 'Reading', description: 'Storytelling' }
        ],
        availability: {
          from: 'Available now',
          duration: 'Flexible',
          visa: 'Not required'
        },
        aboutMe: 'I am passionate about childcare and cultural exchange. I love swimming, art, and teaching kids! I am excited to share experiences and learn from different cultures.'
      };
    }
  }

  // Existing profile data
  const profiles = {
    emma: {
      type: 'aupair' as const,
      id: 'emma',
      name: 'Emma',
      age: 23,
      country: 'Japan',
      flag: '🇯🇵',
      currentLocation: 'Sydney, Australia',
      imageUrl: 'https://images.unsplash.com/photo-1704054006064-2c5b922e7a1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYxNjcyOTM1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      languages: [
        { name: 'Japanese', level: 'Native' },
        { name: 'English', level: 'Intermediate' }
      ],
      education: [
        'Childcare volunteer (2 years)',
        'Swimming coach assistant',
        'First Aid certified'
      ],
      skills: [
        { emoji: '🏊', name: 'Swimming', description: 'Certified instructor' },
        { emoji: '🍳', name: 'Cooking', description: 'Japanese cuisine' },
        { emoji: '🏄', name: 'Surfing' },
        { emoji: '🎨', name: 'Arts & Crafts' }
      ],
      availability: {
        from: 'December 2025',
        duration: '6 months',
        visa: 'Working Holiday'
      },
      aboutMe: 'I love outdoor activities and teaching kids new things. I would love to share Japanese culture while learning English and experiencing life in a new country.'
    },
    lucas: {
      type: 'aupair' as const,
      id: 'lucas',
      name: 'Lucas',
      age: 25,
      country: 'Brazil',
      flag: '🇧🇷',
      currentLocation: 'Rio de Janeiro, Brazil',
      imageUrl: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTc3MDYwMnww&ixlib=rb-4.1.0&q=80&w=1080',
      languages: [
        { name: 'Portuguese', level: 'Native' },
        { name: 'English', level: 'Fluent' },
        { name: 'Spanish', level: 'Intermediate' }
      ],
      education: [
        'Physical Education degree',
        'Football coach (3 years)',
        'Music teacher assistant'
      ],
      skills: [
        { emoji: '⚽', name: 'Football', description: 'Professional coach' },
        { emoji: '🎸', name: 'Music', description: 'Guitar & singing' },
        { emoji: '🏃', name: 'Sports' },
        { emoji: '🎭', name: 'Theater' }
      ],
      availability: {
        from: 'February 2026',
        duration: '12 months',
        visa: 'Work visa'
      },
      aboutMe: 'I am passionate about sports and music. I believe in learning through play and would love to share Brazilian culture with children around the world.'
    },
    sophie: {
      type: 'aupair' as const,
      id: 'sophie',
      name: 'Sophie',
      age: 22,
      country: 'France',
      flag: '🇫🇷',
      currentLocation: 'Paris, France',
      imageUrl: 'https://images.unsplash.com/photo-1664312572933-0563f14484a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjE3MTI0MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      languages: [
        { name: 'French', level: 'Native' },
        { name: 'English', level: 'Fluent' }
      ],
      education: [
        'Early Childhood Education',
        'Art teacher (1 year)',
        'Babysitting experience (4 years)'
      ],
      skills: [
        { emoji: '🎨', name: 'Art', description: 'Painting & drawing' },
        { emoji: '📚', name: 'Reading', description: 'Storytelling' },
        { emoji: '🎭', name: 'Theater' },
        { emoji: '🍰', name: 'Baking' }
      ],
      availability: {
        from: 'January 2026',
        duration: '9 months',
        visa: 'Student visa'
      },
      aboutMe: 'I am creative and love working with children. I enjoy teaching art and helping kids express themselves through creative activities.'
    },
    marco: {
      type: 'aupair' as const,
      id: 'marco',
      name: 'Marco',
      age: 24,
      country: 'Italy',
      flag: '🇮🇹',
      currentLocation: 'Rome, Italy',
      imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGZyaWVuZGx5fGVufDF8fHx8MTc2MTY4MDQxMXww&ixlib=rb-4.1.0&q=80&w=1080',
      languages: [
        { name: 'Italian', level: 'Native' },
        { name: 'English', level: 'Fluent' },
        { name: 'Spanish', level: 'Intermediate' }
      ],
      education: [
        'Culinary Arts diploma',
        'Youth camp counselor (2 years)',
        'Soccer coach assistant'
      ],
      skills: [
        { emoji: '🍳', name: 'Cooking', description: 'Italian cuisine' },
        { emoji: '⚽', name: 'Soccer' },
        { emoji: '🎵', name: 'Music', description: 'Piano' },
        { emoji: '🏃', name: 'Running' }
      ],
      availability: {
        from: 'March 2026',
        duration: '8 months',
        visa: 'Working Holiday'
      },
      aboutMe: 'I love cooking and sharing Italian culture. I believe food brings people together and I enjoy teaching kids about healthy eating and sports.'
    },
    miller: {
      type: 'family' as const,
      id: 'miller',
      name: 'The Miller Family',
      location: 'San Francisco, CA',
      flag: '🇺🇸',
      imageUrl: 'https://images.unsplash.com/photo-1624448445915-97154f5e688c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGZhbWlseSUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MTc3NDg5OXww&ixlib=rb-4.1.0&q=80&w=1080',
      children: [
        { age: 5, emoji: '👧' },
        { age: 3, emoji: '👦' }
      ],
      stayDuration: '12 months',
      hoursPerWeek: '25 hours',
      languages: ['English'],
      lookingFor: [
        'Swimming instructor for kids',
        'Help with cooking and meal prep',
        'English teaching experience preferred',
        'Loves outdoor activities',
        'Patient and energetic'
      ],
      aboutUs: 'We are an active family living in the Bay Area. We love hiking, swimming, and spending time outdoors. We want to provide our children with cultural exchange experiences while ensuring they learn important life skills.'
    },
    tanaka: {
      type: 'family' as const,
      id: 'tanaka',
      name: 'The Tanaka Family',
      location: 'Tokyo, Japan',
      flag: '🇯🇵',
      imageUrl: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBob21lJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYxNzc0OTE4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      children: [
        { age: 7, emoji: '👧' },
        { age: 4, emoji: '👧' }
      ],
      stayDuration: '6 months',
      hoursPerWeek: '20 hours',
      languages: ['Japanese', 'English'],
      lookingFor: [
        'Native English speaker',
        'Experience with music or art',
        'Cultural exchange enthusiast',
        'Reliable and trustworthy'
      ],
      aboutUs: 'We live in central Tokyo and want our daughters to become confident English speakers. We value education and cultural exchange. Our home is welcoming and we love sharing Japanese traditions.'
    },
    garcia: {
      type: 'family' as const,
      id: 'garcia',
      name: 'The Garcia Family',
      location: 'Barcelona, Spain',
      flag: '🇪🇸',
      imageUrl: 'https://images.unsplash.com/photo-1761257517694-8f76923e2b1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJlbnRzJTIwY2hpbGRyZW4lMjB0b2dldGhlcnxlbnwxfHx8fDE3NjE3Nzk1OTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      children: [
        { age: 6, emoji: '👦' }
      ],
      stayDuration: '10 months',
      hoursPerWeek: '30 hours',
      languages: ['Spanish', 'English'],
      lookingFor: [
        'Sports enthusiast',
        'Swimming skills',
        'Outdoor activities lover',
        'Energetic and fun',
        'Flexible schedule'
      ],
      aboutUs: 'We are a beach-loving family in Barcelona. We enjoy sports, swimming, and outdoor adventures. We want our son to learn English while having fun and staying active.'
    }
  };

  return profiles[id as keyof typeof profiles] || profiles.emma;
};

export function ProfileLayout({ profileId, onMessageClick, userType }: ProfileLayoutProps) {
  const profileData = getProfileData(profileId, userType);
  const isMyProfile = profileId === 'me';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Desktop Layout: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Profile Section */}
          <div className="lg:col-span-8">
            <ProfileDetail 
              profile={profileData}
              onMessageClick={onMessageClick}
            />
          </div>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
            {!isMyProfile && (
              <>
                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button className="w-full bg-pink-500 hover:bg-pink-600">
                      <Heart className="w-4 h-4 mr-2" />
                      Add to Favorites
                    </Button>
                    <Button className="w-full bg-blue-500 hover:bg-blue-600">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Profile
                    </Button>
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </Card>

                {/* Match Score */}
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Match Score
                  </h3>
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-green-600 mb-2">85%</div>
                    <p className="text-sm text-gray-600">Great Match!</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Languages</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">✓ Match</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{profileData.type === 'aupair' ? 'Skills' : 'Requirements'}</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">✓ Match</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Duration</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">✓ Match</Badge>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Similar Profiles */}
            <Card className="p-6">
              <h3 className="mb-4">
                {profileData.type === 'aupair' ? 'Similar Au Pairs' : 'Similar Families'}
              </h3>
              <div className="space-y-3">
                {profileData.type === 'aupair' ? (
                  <>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-rose-300 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Sophie 🇫🇷</p>
                        <p className="text-xs text-gray-500">French, English</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-300 to-orange-300 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Maria 🇪🇸</p>
                        <p className="text-xs text-gray-500">Spanish, English</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Anna 🇩🇪</p>
                        <p className="text-xs text-gray-500">German, English</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-300 to-rose-300 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Smith Family 🇬🇧</p>
                        <p className="text-xs text-gray-500">London • 2 kids</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Chen Family 🇨🇳</p>
                        <p className="text-xs text-gray-500">Beijing • 1 kid</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-300 to-orange-300 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Müller Family 🇩🇪</p>
                        <p className="text-xs text-gray-500">Berlin • 3 kids</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
