import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { SubscriptionGate } from "@/components/subscription-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Scale, 
  TrendingUp, 
  FileSearch, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  Gavel,
  BookOpen,
  Zap,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrentCase } from "@/lib/case-context";
import { 
  LegalAnalyticsEngine,
  type CaseOutcomePrediction,
  type JudgeAnalytics,
  type LegalPrecedent,
  type StrategyRecommendation,
  prioritizeRecommendations,
  formatSuccessRate,
  categorizeRisk
} from "@/lib/legal-analytics";

function LegalAnalyticsContent() {
  const [prediction, setPrediction] = useState<CaseOutcomePrediction | null>(null);
  const [judgeAnalytics, setJudgeAnalytics] = useState<JudgeAnalytics | null>(null);
  const [precedents, setPrecedents] = useState<LegalPrecedent[]>([]);
  const [strategies, setStrategies] = useState<StrategyRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("prediction");
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { currentCase } = useCurrentCase();

  const runFullAnalysis = async () => {
    if (!currentCase) {
      setError("Please select a case to analyze");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Run all analytics in parallel for efficiency
      const [predictionResult, precedentsResult, strategiesResult] = await Promise.all([
        LegalAnalyticsEngine.predictCaseOutcome(currentCase),
        LegalAnalyticsEngine.findRelevantPrecedents(currentCase),
        LegalAnalyticsEngine.generateStrategyRecommendations(currentCase),
      ]);

      setPrediction(predictionResult);
      setPrecedents(precedentsResult);
      setStrategies(prioritizeRecommendations(strategiesResult));

      // Analyze judge if available
      if (currentCase.judge) {
        const judgeResult = await LegalAnalyticsEngine.analyzeJudge(
          currentCase.judge, 
          currentCase.court
        );
        setJudgeAnalytics(judgeResult);
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      setError("Failed to complete legal analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSuccessColor = (likelihood: number) => {
    if (likelihood >= 70) return "text-green-600";
    if (likelihood >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800";
    if (confidence >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return "bg-red-100 text-red-800 border-red-200";
      case 'medium': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'low': return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className={cn("h-screen overflow-y-auto", isMobile ? "pt-16" : "")}>
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <Header
          title="CaseBuddy AI Analytics"
          searchPlaceholder="Search legal insights..."
        />

        {!currentCase && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Please select a case to run AI-powered legal analytics and predictions.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Analytics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="rounded-xl stats-card">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-blue-600">
                {prediction ? `${prediction.successLikelihood}%` : '--'}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Success Likelihood</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl stats-card">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <FileSearch className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-green-600">{precedents.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Relevant Precedents</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl stats-card">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-purple-600">{strategies.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Strategy Recommendations</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl stats-card">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3">
                <Gavel className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
              </div>
              <div className="text-lg md:text-2xl font-bold text-orange-600">
                {judgeAnalytics ? judgeAnalytics.totalCases : '--'}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Judge Cases</div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Control */}
        <Card className="rounded-xl brief-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">AI Legal Analysis</h3>
                <p className="text-muted-foreground">
                  Run comprehensive AI analysis including case outcome prediction, judge analytics, 
                  precedent research, and strategic recommendations.
                </p>
              </div>
              <Button 
                onClick={runFullAnalysis}
                disabled={!currentCase || isAnalyzing}
                size="lg"
                className="w-full md:w-auto"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="prediction">Prediction</TabsTrigger>
            <TabsTrigger value="precedents">Precedents</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="judge">Judge Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="prediction" className="space-y-4">
            <Card className="rounded-xl brief-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Case Outcome Prediction
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prediction ? (
                  <div className="space-y-6">
                    {/* Success Likelihood */}
                    <div className="text-center">
                      <div className={cn("text-4xl font-bold mb-2", getSuccessColor(prediction.successLikelihood))}>
                        {prediction.successLikelihood}%
                      </div>
                      <p className="text-muted-foreground">Success Likelihood</p>
                      <Badge className={cn("mt-2", getConfidenceColor(prediction.confidence))}>
                        {prediction.confidence}% Confidence
                      </Badge>
                    </div>

                    <Progress value={prediction.successLikelihood} className="w-full" />

                    {/* Key Factors */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {prediction.strengths.map((strength, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          Risk Factors
                        </h4>
                        <ul className="space-y-2">
                          {prediction.riskFactors.map((risk, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold mb-3">AI Recommendations</h4>
                      <div className="space-y-2">
                        {prediction.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Similar Cases */}
                    {prediction.similarCases && prediction.similarCases.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Similar Cases</h4>
                        <div className="space-y-3">
                          {prediction.similarCases.map((similarCase) => (
                            <div key={similarCase.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium">{similarCase.title}</h5>
                                <Badge variant={similarCase.outcome === 'won' ? 'default' : 'secondary'}>
                                  {similarCase.outcome}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {similarCase.jurisdiction} • {similarCase.year}
                              </p>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">
                                  {similarCase.similarity}% similarity
                                </span>
                                <Progress value={similarCase.similarity} className="flex-1 max-w-32" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Run analysis to see case outcome prediction</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="precedents" className="space-y-4">
            <Card className="rounded-xl brief-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Relevant Legal Precedents
                  <Badge variant="secondary">{precedents.length} found</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {precedents.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {precedents.map((precedent) => (
                        <div key={precedent.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{precedent.caseName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {precedent.citation} • {precedent.court} • {precedent.year}
                              </p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                              {precedent.relevanceScore}% relevant
                            </Badge>
                          </div>
                          
                          <p className="text-sm mb-3">{precedent.keyHolding}</p>
                          
                          <div className="mb-3">
                            <h5 className="text-sm font-medium mb-2">Legal Principles:</h5>
                            <div className="flex flex-wrap gap-1">
                              {precedent.legalPrinciples.map((principle, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {principle}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium mb-2">Application Suggestions:</h5>
                            <ul className="text-sm space-y-1">
                              {precedent.applicationSuggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <FileSearch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Run analysis to find relevant legal precedents</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-4">
            <Card className="rounded-xl brief-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Strategic Recommendations
                  <Badge variant="secondary">{strategies.length} recommendations</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {strategies.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {strategies.map((strategy, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{strategy.title}</h4>
                              <p className="text-sm text-muted-foreground capitalize">
                                {strategy.category} • {strategy.timeframe}
                              </p>
                            </div>
                            <Badge className={getPriorityColor(strategy.priority)}>
                              {strategy.priority} priority
                            </Badge>
                          </div>
                          
                          <p className="text-sm mb-3">{strategy.description}</p>
                          
                          <div className="mb-3">
                            <h5 className="text-sm font-medium mb-2">Reasoning:</h5>
                            <p className="text-sm text-muted-foreground">{strategy.reasoning}</p>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <h5 className="text-sm font-medium mb-2 text-green-700">Benefits:</h5>
                              <ul className="text-sm space-y-1">
                                {strategy.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium mb-2 text-red-700">Risks:</h5>
                              <ul className="text-sm space-y-1">
                                {strategy.risks.map((risk, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                                    {risk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium mb-2">Next Steps:</h5>
                            <ol className="text-sm space-y-1">
                              {strategy.nextSteps.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="w-4 h-4 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                                    {idx + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Run analysis to get strategic recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="judge" className="space-y-4">
            <Card className="rounded-xl brief-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="w-5 h-5" />
                  Judge Analytics
                  {judgeAnalytics && (
                    <Badge variant="secondary">{judgeAnalytics.judgeName}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {judgeAnalytics ? (
                  <div className="space-y-6">
                    {/* Judge Overview */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{judgeAnalytics.totalCases}</div>
                        <p className="text-sm text-muted-foreground">Total Cases</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{judgeAnalytics.averageCaseDuration}</div>
                        <p className="text-sm text-muted-foreground">Avg Duration (days)</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatSuccessRate(judgeAnalytics.rulingTendencies.plaintiffFavorable)}
                        </div>
                        <p className="text-sm text-muted-foreground">Plaintiff Favorable</p>
                      </div>
                    </div>

                    {/* Ruling Tendencies */}
                    <div>
                      <h4 className="font-semibold mb-3">Ruling Tendencies</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Plaintiff Favorable</span>
                          <div className="flex items-center gap-2">
                            <Progress value={judgeAnalytics.rulingTendencies.plaintiffFavorable} className="w-24" />
                            <span className="text-sm font-medium">
                              {formatSuccessRate(judgeAnalytics.rulingTendencies.plaintiffFavorable)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Defendant Favorable</span>
                          <div className="flex items-center gap-2">
                            <Progress value={judgeAnalytics.rulingTendencies.defendantFavorable} className="w-24" />
                            <span className="text-sm font-medium">
                              {formatSuccessRate(judgeAnalytics.rulingTendencies.defendantFavorable)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Settlements</span>
                          <div className="flex items-center gap-2">
                            <Progress value={judgeAnalytics.rulingTendencies.settlements} className="w-24" />
                            <span className="text-sm font-medium">
                              {formatSuccessRate(judgeAnalytics.rulingTendencies.settlements)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Case Types */}
                    <div>
                      <h4 className="font-semibold mb-3">Case Types</h4>
                      <div className="space-y-2">
                        {judgeAnalytics.caseTypes.map((caseType, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">{caseType.type}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{caseType.count} cases</span>
                              <Badge variant="outline">
                                {formatSuccessRate(caseType.successRate)} success
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Trends */}
                    <div>
                      <h4 className="font-semibold mb-3">Recent Trends</h4>
                      <div className="space-y-2">
                        {judgeAnalytics.recentTrends.map((trend, index) => (
                          <div key={index} className="p-3 bg-muted rounded-lg text-sm">
                            {trend}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold mb-3">Strategic Recommendations</h4>
                      <div className="space-y-2">
                        {judgeAnalytics.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gavel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {currentCase?.judge 
                        ? "Run analysis to get insights about this judge" 
                        : "No judge assigned to this case"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function LegalAnalyticsPage() {
  return (
    <SubscriptionGate 
      feature="AI-Powered Legal Analytics" 
      description="Get case outcome predictions, judge behavior analysis, legal precedent finder, and strategic recommendations powered by advanced AI."
    >
      <LegalAnalyticsContent />
    </SubscriptionGate>
  );
}